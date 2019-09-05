/*global window, document */
"use strict";

let Lode_runner = {};

// Configuration
Lode_runner.Config = function (text, number_of_lvl) {
    // Box size in pixels
    this.number_of_lvl = number_of_lvl;
    this.number_of_pixels_in_one_grid = 5;
    let field = processing_lvl(text[number_of_lvl].split('\n'));
    this.level = field[0];
    this.enemies = field[1];
    this.start_field = text;
    this.leftMargin = 0;
    this.topMargin = 0;
    this.main_hero = field[2];
    this.number_of_cakes = field[3];
    this.window_width = window.innerWidth;
    this.window_height = window.innerHeight;
    this.field_painted = false;
    // list for crashed cells
    this.crashed_cells = [];
    this.length = this.level.length * this.number_of_pixels_in_one_grid;
};

// Initial game state
Lode_runner.State = function () {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.ticks = 0;
    this.speed = 2;
    this.paused = false;
    this.started = false;
    this.direction = 0;
    // pause between two frames
    this.loopIntervalMillis = 67.5;
};

// Const keycodes
Lode_runner.Direction = {
    // control the main hero
    Up: 38,
    Down: 40,
    Left: 37,
    Right: 39,
    Z: 90,
    X: 88,
};

Lode_runner.KeyCode = {
    // buttons for change state of game
    Pause: 80,
    Resume: 82,
    H: 72,
    C: 67,
    V: 86,
};

// Game engine
Lode_runner.Game = function (doc, wnd, field, user_name) {
    // load new sounds
    let myMusic = new sound("./music/hi.mp3");
    myMusic.play();

    this.config = new Lode_runner.Config(field, 0);
    this.state = new Lode_runner.State();

    doc.onkeydown = this.onkeydown.bind(this);
    doc.onkeyup = this.onkeyup.bind(this);

    // save user name
    this.user_name = user_name;
    this.doc = doc;
    this.wnd = wnd;

    // Force first loop, to make game more responsive at first
    this.loop();
};

Lode_runner.Game.prototype.stateDescription = function () {
    // description of state
    if (this.state.paused) {
        return "Paused (Press R To resume)";
    }
    return "Press P to pause";
};

Lode_runner.Game.prototype.drawHUD = function () {
    // update description
    this.doc.getElementById("level").innerHTML = this.state.level;
    this.doc.getElementById("score").innerHTML = this.state.score;
    this.doc.getElementById("lives").innerHTML = this.state.lives;
    this.doc.getElementById("state").innerHTML = this.stateDescription();
};

Lode_runner.Game.prototype.draw = function () {
    // check game status
    if (this.config.window_width !== window.innerWidth || this.config.window_height !== window.innerHeight) {
        this.state.paused = true;
    }

    this.drawHUD();

    if (!this.config.field_painted || this.config.window_width !== window.innerWidth || this.config.window_height !== window.innerHeight) {
        // draw a level if needed
        let topMargin = this.doc.getElementById('hud').offsetHeight;
        let leftMargin = 0;
        let new_h_pixel_size = window.innerWidth / (this.config.level[0].length * this.config.level[0][0].number_of_pixels);
        let new_v_pixel_size = (window.innerHeight - topMargin) / (this.config.level.length * this.config.level[0][0].number_of_pixels);
        let new_pixel_size = new_h_pixel_size > new_v_pixel_size ? new_v_pixel_size : new_h_pixel_size;
        if (new_pixel_size !== new_h_pixel_size) {
            leftMargin = (window.innerWidth - this.config.level[0].length * this.config.level[0][0].number_of_pixels * new_pixel_size) / 2;
        } else {
            let new_topMargin = (window.innerHeight - this.config.level.length * this.config.level[0][0].number_of_pixels * new_pixel_size) / 2;
            if (new_topMargin > topMargin) {
                topMargin = new_topMargin;
            }
        }
        // change basic characteristics of drawing
        this.config.topMargin = topMargin;
        this.config.leftMargin = leftMargin;
        this.config.main_hero.leftMargin = leftMargin;
        this.config.main_hero.topMargin = topMargin;
        for (let index = 0; index < this.config.enemies.length; ++index) {
            this.config.enemies[index].leftMargin = leftMargin;
            this.config.enemies[index].topMargin = topMargin;
        }
        for (let i = 0; i < this.config.level.length; ++i) {
            for (let j = 0; j < this.config.level[i].length; ++j) {
                this.config.level[i][j].pixel_size = new_pixel_size;
                this.config.level[i][j].draw(this.doc, topMargin, leftMargin);
            }
        }
        this.config.field_painted = true;
        if (this.config.window_width !== window.innerWidth || this.config.window_height !== window.innerHeight) {
            this.state.started = false;
        }
        this.config.window_width = window.innerWidth;
        this.config.window_height = window.innerHeight;
        this.state.paused = false;
    }
};

Lode_runner.Game.prototype.update_enemies = function () {
    // update state of mobs
    if (!this.state.started || this.state.paused) {
        return;
    }

    for (let i = 0; i < this.config.enemies.length; ++i) {
        this.config.enemies[i].mob_move(this.config.main_hero, this.config.leftMargin, this.config.topMargin, this.config.enemies);
    }
};

Lode_runner.Game.prototype.draw_enemies = function () {
    // draw enemies
    for (let i = 0; i < this.config.enemies.length; ++i) {
        this.config.enemies[i].draw(this.doc);
    }
};

Lode_runner.Game.prototype.draw_main_hero = function () {
    // draw main hero
    this.config.main_hero.draw(this.doc);
};

Lode_runner.Game.prototype.check_available_cell = function (cell) {
    // check if cell is available to move
    return !(this.config.level[this.config.main_hero.x][this.config.main_hero.y + cell].type === '.' || this.config.level[this.config.main_hero.x][this.config.main_hero.y + cell].type === '_');
};

Lode_runner.Game.prototype.move_main_hero_right = function () {
    // Control the main character to the right
    if (!this.check_available_cell(1) && this.config.main_hero.state === 0) {
        return;
    }
    this.config.main_hero.move_right(this.config.leftMargin, this.config.topMargin);
};

Lode_runner.Game.prototype.move_main_hero_left = function () {
    // Control the main character to the left
    if (!this.check_available_cell(-1) && this.config.main_hero.state === 0) {
        return;
    }
    this.config.main_hero.move_left(this.config.leftMargin, this.config.topMargin);
};

Lode_runner.Game.prototype.get_records = function () {
    // print table with results
    let table = '';
    let score = '';
    let name = ' ';
    // get results
    for (let index = 0; index < 10; ++index) {
        table += String(index + 1) + '.';
        score = localStorage.getItem(String(index));
        name = localStorage.getItem(String(index) + 'name');
        if (score !== null && name !== null) {
            table += name + ' - ' + score;
        }
        table += '\n';
    }
    alert(table);
};

Lode_runner.Game.prototype.update_records = function () {
    // update old results with new
    let score = '';
    let old_score = '';
    let old_name = '';
    let name = '';
    for (let index = 0; index < 10; ++index) {
        score = localStorage.getItem(String(index));
        name = localStorage.getItem(String(index) + 'name');
        if (score !== null && name !== null) {
            if (parseInt(score) < this.state.score) {
                // change place of users
                old_score = score;
                old_name = name;
                localStorage.setItem(String(index), String(this.state.score));
                localStorage.setItem(String(index) + 'name', this.user_name);
                this.state.score = 0;
            } else if (old_score !== '') {
                localStorage.setItem(String(index), String(old_score));
                localStorage.setItem(String(index) + 'name', old_name);
                old_score = score;
                old_name = name;
            }
        } else if (this.state.score !== 0 || old_score !== '') {
            if (old_score === '') {
                localStorage.setItem(String(index), String(this.state.score));
                localStorage.setItem(String(index) + 'name', this.user_name);
            } else {
                localStorage.setItem(String(index), old_score);
                localStorage.setItem(String(index) + 'name', old_name);
            }
            break;
        }
    }
};

Lode_runner.Game.prototype.move_main_hero_down = function () {
    // Control the main character to the down
    this.config.main_hero.move_down(this.config.leftMargin, this.config.topMargin);
    if (this.config.main_hero.state === 0) {
        this.toDown = false;
    }
};

Lode_runner.Game.prototype.crashing_block = function (index_of_block) {
    // animaton of crashing block by main hero
    let left_cell = this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].type;
    let left_down_cell = this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].type;

    // check if this cell can be crashed
    if ((left_cell !== ' ' && left_cell !== 'A') || (left_down_cell !== '_' && left_down_cell !== ' ') || this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].cake || (this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].crashed && this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].state === 0)) {
        if (index_of_block === -1) {
            this.crash_left_block = false;
        } else {
            this.crash_right_block = false;
        }
        return;
    }

    // check if enemies allow crash cell
    for (let index = 0; index < this.config.enemies.length; ++index) {
        if (this.config.enemies[index].x === this.config.main_hero.x && this.config.enemies[index].y === (this.config.main_hero.y + index_of_block)) {
            if (index_of_block === -1) {
                this.crash_left_block = false;
            } else {
                this.crash_right_block = false;
            }
            this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].state = 0;
            this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].type = ' ';
            this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].state = 0;
            this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].type = '_';
            this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].draw(this.doc, this.config.topMargin, this.config.leftMargin);
            this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].crashed = false;
            this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].draw(this.doc, this.config.topMargin, this.config.leftMargin);
            return;
        }
    }

    // new base characteristics of all cells and mobs
    this.config.main_hero.state = 0;
    this.config.main_hero.leftMargin = this.config.leftMargin;
    this.config.main_hero.topMargin = this.config.topMargin;
    if (index_of_block === -1) {
        this.config.main_hero.direction = Lode_runner.Direction.Left;
    } else {
        this.config.main_hero.direction = Lode_runner.Direction.Right;
    }
    this.config.main_hero.not_block = false;
    this.config.main_hero.draw(this.doc);

    // change state of all cells and mobs
    this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].type = 'A';
    this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].draw(this.doc, this.config.topMargin, this.config.leftMargin);
    this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].state += 1;
    this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].type = ' ';
    this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].crashed = true;
    this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].draw(this.doc, this.config.topMargin, this.config.leftMargin);
    this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].state += 1;

    if (this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].state === 6) {
        // check extra situations
        if (index_of_block === -1) {
            this.crash_left_block = false;
        } else {
            this.crash_right_block = false;
        }
        this.state.score += 100;
        this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].state = 0;
        this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].state = 0;
        this.config.level[this.config.main_hero.x][this.config.main_hero.y + index_of_block].type = ' ';
        this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y + index_of_block].delete(this.doc);
        this.config.crashed_cells.push([this.config.main_hero.x + 1, this.config.main_hero.y + index_of_block, this.state.ticks]);
    }
};

Lode_runner.Game.prototype.move_main_hero_up_ladder = function () {
    this.config.main_hero.move_up_ladder(this.config.leftMargin, this.config.topMargin);
};

Lode_runner.Game.prototype.move_main_hero_down_ladder = function () {
    this.config.main_hero.move_down_ladder(this.config.leftMargin, this.config.topMargin);
};

Lode_runner.Game.prototype.move_main_hero_left_rope = function () {
    this.config.main_hero.move_left_rope(this.config.leftMargin, this.config.topMargin);
};

Lode_runner.Game.prototype.move_main_hero_right_rope = function () {
    this.config.main_hero.move_right_rope(this.config.leftMargin, this.config.topMargin);
};

Lode_runner.Game.prototype.clear_field = function () {
    // full delete of game
    for (let i = 0; i < this.config.enemies.length; ++i) {
        this.config.enemies[i].delete(this.doc);
    }
    for (let i = 0; i < this.config.level.length; ++i) {
        for (let j = 0; j < this.config.level[i].length; ++j) {
            this.config.level[i][j].delete(this.doc);
        }
    }
    this.config.main_hero.delete(this.doc);
};

Lode_runner.Game.prototype.check_game_status = function () {
    // check game status
    // check if main hero eat cake
    if (this.config.level[this.config.main_hero.x][this.config.main_hero.y].cake) {
        this.state.score += 1000;
        this.config.number_of_cakes -= 1;
        this.config.level[this.config.main_hero.x][this.config.main_hero.y].cake = false;
        this.config.level[this.config.main_hero.x][this.config.main_hero.y].delete(this.doc);
    }

    // check if number of cakes is zero/ if yes, then draw ladder to exit
    if (this.config.number_of_cakes === 0) {
        this.config.number_of_cakes = -1;
        for (let index_x = 0; index_x < this.config.level.length; ++index_x) {
            for (let index_y = 0; index_y < this.config.level[index_x].length; ++index_y) {
                if (this.config.level[index_x][index_y].type === 'E') {
                    this.config.level[index_x][index_y].type = '|';
                    this.config.level[index_x][index_y].draw(this.doc, this.config.topMargin, this.config.leftMargin);
                }
            }
        }
    }

    // check if hero is in point of exit from game
    if (this.config.main_hero.x === 0) {
        this.config.number_of_lvl += 1;
        this.state.score += 2000;
        if (this.config.number_of_lvl === 3) {
            alert('You win!');
            this.state.lives = 3;
            this.state.score = 0;
            this.config.number_of_lvl = 0;
        } else {
            alert('You finished ' + this.config.number_of_lvl + ' level!');
        }
        this.clear_field();
        this.config = new Lode_runner.Config(this.config.start_field, this.config.number_of_lvl);
        this.state.direction = 0;
        this.state.started = false;
    }

    // check if mobs kill main hero
    for (let index = 0; index < this.config.enemies.length; ++index) {
        if (this.config.enemies[index].x === this.config.main_hero.x && this.config.enemies[index].y === this.config.main_hero.y) {
            this.state.lives -= 1;
            if (this.state.lives !== 0) {
                alert('You died !:)');
            } else {
                this.state.lives = 3;
                this.update_records();
                this.state.score = 0;
                alert('You lose!');
            }
            this.clear_field();
            this.config = new Lode_runner.Config(this.config.start_field, this.config.number_of_lvl);
            this.state.direction = 0;
            this.state.started = false;
            break;
        }

        // check if mob eat cake
        if (this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].cake && !this.config.enemies[index].have_cake) {
            this.config.enemies[index].have_cake = true;
            this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].cake = false;
            this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].delete(this.doc);
        }

        // check if mob spat out cake
        if (this.config.enemies[index].have_cake && this.config.enemies[index].toDown) {
            if (this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].type === ' ') {
                this.config.enemies[index].have_cake = false;
                this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].cake = true;
                this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].draw(this.doc, this.config.topMargin, this.config.leftMargin);
            }
        }

        // search new position of mob spawn
        if (this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].type === '_') {
            for (let index_x = 1; index_x < this.config.level.length; ++index_x) {
                if (this.config.level[index_x][this.config.enemies[index].y].type === ' ' && this.config.level[index_x + 1][this.config.enemies[index].y].type === ' ' && !this.config.level[index_x][this.config.enemies[index].y].cake && !this.config.level[index_x][this.config.enemies[index].y].have_mob) {
                    this.config.enemies[index].x = index_x;
                    this.config.enemies[index].state = 0;
                    break;
                } else if (index_x === this.config.level.length - 1) {
                    this.state.score += 1000;
                }
            }
            this.config.level[this.config.enemies[index].x][this.config.enemies[index].y].have_mob = false;
            this.state.score += 500;
        }
    }
    // redrawing of crashed blocks
    for (let index_crashed = 0; index_crashed < this.config.crashed_cells.length; ++index_crashed) {
        let x = this.config.crashed_cells[index_crashed][0];
        let y = this.config.crashed_cells[index_crashed][1];
        // check for mob`s dead
        for (let index = 0; index < this.config.enemies.length; ++index) {
            let e_x = this.config.enemies[index].x;
            let e_y = this.config.enemies[index].y;
            if (x === e_x && y === e_y && this.config.level[x][y].state === 1) {
                for (let index_x = 1; index_x < this.config.level.length; ++index_x) {
                    if (this.config.level[index_x][this.config.enemies[index].y].type === ' ') {
                        this.config.enemies[index].x = index_x;
                        this.config.enemies[index].state = 0;
                        break;
                    }
                }
                this.config.level[x][y].have_mob = false;
                this.state.score += 500;
            }

            if ((x === e_x || (x === (e_x + 1))) && (y === e_y)) {
                break;
            }
            if (index === (this.config.enemies.length - 1)) {
                this.config.level[x][y].have_mob = false;
            }
        }
        // check for main hero dead
        if (this.config.main_hero.x === x && this.config.main_hero.y === y && this.config.level[x][y].state === 1) {
            this.state.lives -= 1;
            if (this.state.lives !== 0) {
                alert('You died !:)');
            } else {
                this.state.lives = 3;
                this.update_records();
                this.state.score = 0;
                alert('You lose!');
            }
            this.clear_field();
            this.config = new Lode_runner.Config(this.config.start_field, this.config.number_of_lvl);
            this.state.direction = 0;
            this.state.started = false;
            return;
        }
        // redraw crashed cells
        if ((this.state.ticks - this.config.crashed_cells[index_crashed][2]) > 60) {
            this.config.level[x][y].redraw = true;
            this.config.level[x][y].delete(this.doc);
            this.config.level[x][y].state = 5 - this.state.ticks + this.config.crashed_cells[index_crashed][2] + 61;
            this.config.level[x][y].draw(this.doc, this.config.topMargin, this.config.leftMargin);
            if (this.config.level[x][y].state === 0) {
                this.config.level[x][y].crashed = false;
                this.config.level[x][y].redraw = false;
                this.config.level[x][y].type = '_';
                this.config.crashed_cells.shift();
                return;
            }
        }
    }
};

Lode_runner.Game.prototype.update_main_hero = function () {
    // main hero upgrade depending on user control
    if (this.state.paused || !this.state.started) {
        return;
    }

    let current_cell = this.config.level[this.config.main_hero.x][this.config.main_hero.y].type;
    let current_down_cell = this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y].type;

    if (current_cell !== '-' && current_cell !== '|' && (current_down_cell === ' ' || current_down_cell === '-' || current_down_cell === 'E') && !this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y].have_mob) {
        this.move_main_hero_down();
    } else if (this.state.direction === Lode_runner.Direction.Z || this.crash_left_block) {
        this.crash_left_block = true;
        this.crashing_block(-1);
    } else if (this.state.direction === Lode_runner.Direction.X || this.crash_right_block) {
        this.crash_right_block = true;
        this.crashing_block(1);
    } else if (this.state.direction === Lode_runner.Direction.Up && current_cell === '|') {
        this.move_main_hero_up_ladder();
    } else if (this.state.direction === Lode_runner.Direction.Down && (current_cell === '|' || current_down_cell === '|') && current_down_cell !== '.' && current_down_cell !== '_') {
        this.move_main_hero_down_ladder();
    } else if (this.state.direction === Lode_runner.Direction.Right) {
        if (current_cell === '-') {
            this.move_main_hero_right_rope();
        } else {
            this.move_main_hero_right();
        }
    } else if (this.state.direction === Lode_runner.Direction.Left) {
        if (current_cell === '-') {
            this.move_main_hero_left_rope();
        } else {
            this.move_main_hero_left();
        }
    } else if (current_cell === '-' && (this.state.direction === Lode_runner.Direction.Down || this.toDown) && (current_down_cell === ' ' || current_down_cell === '|' || current_down_cell === '-' || current_down_cell === 'E') && !this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y].have_mob) {
        this.toDown = true;
        this.move_main_hero_down();
    }
};

Lode_runner.Game.prototype.clear_records = function () {
    // delete all records
    localStorage.clear();
};

Lode_runner.Game.prototype.onkeydown = function (event) {
    // check key down and processing this click
    let code = event.keyCode;
    if (Lode_runner.Direction.Up === code || Lode_runner.Direction.Down === code || Lode_runner.Direction.Left === code || Lode_runner.Direction.Right === code || code === 32) {
        event.preventDefault();
    }

    if (code === Lode_runner.KeyCode.C) {
        this.user_name = prompt("What is your name?");
        localStorage.setItem('name', this.user_name);
    }

    if (code === Lode_runner.KeyCode.H) {
        this.get_records();
    }

    if (code === Lode_runner.KeyCode.V) {
        this.clear_records();
    }

    if (event.ctrlKey) {
        if (Lode_runner.Direction.Up === code || Lode_runner.Direction.Right === code) {
            this.state.speed -= 1;
        } else if (Lode_runner.Direction.Down === code || Lode_runner.Direction.Left === code) {
            this.state.speed += 1;
        }
        if (this.state.speed <= 0) {
            this.state.speed = 3;
        }
        if (this.state.speed >= 4) {
            this.state.speed = 1;
        }
    } else {
        if ((Lode_runner.Direction.Up === code && Lode_runner.Direction.Down !== this.state.direction)
            || (Lode_runner.Direction.Down === code && Lode_runner.Direction.Up !== this.state.direction)
            || (Lode_runner.Direction.Left === code && Lode_runner.Direction.Right !== this.state.direction)
            || (Lode_runner.Direction.Right === code && Lode_runner.Direction.Left !== this.state.direction)
            || (Lode_runner.Direction.Z === code && Lode_runner.Direction.Z !== this.state.direction)
            || (Lode_runner.Direction.X === code && Lode_runner.Direction.X !== this.state.direction)) {
            this.state.direction = code;
            this.state.started = true;
            this.state.lastKeyTick = this.state.ticks;
        } else if (Lode_runner.KeyCode.Pause === code) {
            this.state.paused = true;
        } else if (Lode_runner.KeyCode.Resume === code) {
            this.state.paused = false;
        }
    }
    return true;
};

Lode_runner.Game.prototype.onkeyup = function (event) {
    this.state.direction = 0;
};

Lode_runner.Game.prototype.loop = function () {
    // main game loop
    // update all characters => draw all characters => check game status
    this.update_main_hero();
    if (this.state.ticks % this.state.speed === 0) {
        this.update_enemies();
        this.draw_enemies();
    }
    this.check_game_status();
    this.draw();
    this.draw_main_hero();
    this.state.ticks = this.state.ticks + 1;
    this.wnd.setTimeout(this.loop.bind(this), this.state.loopIntervalMillis);
};

// Start game
let text = [];
try {
    // read levels from file
    text.push(read_level_from_file("./levels/level1.txt"));
    text.push(read_level_from_file("./levels/level2.txt"));
    text.push(read_level_from_file("./levels/level3.txt"));
} catch (error) {
    // extra level mapping option
    text.push('........................E..........\n' +
        '.                       E         .\n' +
        '.     *        ^        E         .\n' +
        '.________|_________     E         .\n' +
        '.        |------------  E *       .\n' +
        '.        |    __|     ________|___.\n' +
        '.        |    __|             |   .\n' +
        '.        |    __|             |   .\n' +
        '.     ^  |    __|             |   .\n' +
        '.__|______    ________|___________.\n' +
        '.  |                  |           .\n' +
        '.  |                  |           .\n' +
        '.  |       ^   H      |           .\n' +
        '._________|___________|           .\n' +
        '.         |           |           .\n' +
        '.         |           |           .\n' +
        '.       * |-----------|    ^ *    .\n' +
        '.   |_______          ___________|.\n' +
        '.   |  ^            *        ^   |.\n' +
        '._________________________________.\n' +
        '...................................');
    text.push('............................E.\n' +
        '.   *                       E.\n' +
        '.|.._..|           *        E.\n' +
        '.|     |    |_________| *   E.\n' +
        '.| * ^ |    |         |_____E.\n' +
        '.|_._._|    |         |      .\n' +
        '.|     |----|------  ^|      .\n' +
        '.|     |    |     |___......|.\n' +
        '.|     |    |  *  |         |.\n' +
        '.|   ^ | *  |_____|         |.  \n' +
        '..___.__.__.|         |___|__.\n' +
        '..___.      |         |   |  .\n' +
        '..*  .      |   ------|   | *.\n' +
        '.________|___....     |  ____.\n' +
        '.        |            |      .\n' +
        '.        | H          |      .\n' +
        '.____________________________.\n' +
        '..............................');
    text.push('...................E..........\n' +
        '.__________________E_________.\n' +
        '._ *               E_ ^ *   _.\n' +
        '._____|____|     * E_______|_.\n' +
        '._____|______________ ___  |_.\n' +
        '._    |  * ^     ____ ___  |_.\n' +
        '._|_________|________ ___  |_.\n' +
        '._|   ______|_____**_ ___* |_.\n' +
        '._|   ______|______________|_.\n' +
        '._|   _    *|    *  ^   * _|_.\n' +
        '._|   ___|_______|_______|_|_.\n' +
        '._|  *___|       |_______|_|_.\n' +
        '._|____  |     H |  __   |_|_.\n' +
        '._|____|______|_______** |_|_.\n' +
        '._|____|______|_____*______|_.\n' +
        '._|^   |___*__|   *  ^     |_.\n' +
        '.____________________________.\n' +
        '..............................');
}

// get user name
let user_name = localStorage.getItem('name');
if (user_name === null) {
    user_name = prompt("What is your name?");
    localStorage.setItem('name', user_name);
}

document.game = new Lode_runner.Game(document, window, text, user_name);