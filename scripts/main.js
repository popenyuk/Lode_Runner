/*global window, document */
"use strict";

let Lode_runner = {};

class block {
    constructor(type, index_x, index_y, length) {
        this.cake = false;
        if (type === 'H' || type === '^' || type === '*') {
            this.type = " ";
        }
        if (type === "*") {
            this.cake = true;
        } else {
            this.type = type;
        }
        this.index_x = index_x;
        this.index_y = index_y;
        this.length = length;
        this.number_of_pixels = 6;
        this.pixel_size = 6;
        this.pixels = initialize_empty_array(this.number_of_pixels);
    }

    draw(doc, topMargin, leftMargin) {
        for (let i = 0; i < this.number_of_pixels; ++i) {
            for (let j = 0; j < this.number_of_pixels; ++j) {
                // we use 6 as this.pixel, because if we wouldn`t use it, we will have different ID`s and then we will change extension of page cells will get different ID`s
                let div = this.pixels[i][j];
                if (div === null) {
                    div = doc.createElement('div');
                    doc.body.appendChild(div);
                    this.pixels[i][j] = div;
                }
                div.style.left = leftMargin + this.index_y * this.number_of_pixels * this.pixel_size + i * this.pixel_size + 'px';
                div.style.top = topMargin + (this.index_x * this.number_of_pixels * this.pixel_size + j * this.pixel_size) + 'px';
                if (this.type === '|') {
                    if (i === 1 || i === 4) {
                        div.style.width = this.pixel_size / 2 + 'px';
                        div.style.height = this.pixel_size + 'px';
                        if (i === 4) {
                            div.style.left = leftMargin + this.index_y * this.number_of_pixels * this.pixel_size + i * this.pixel_size + this.pixel_size + 'px';
                        } else {
                            div.style.left = leftMargin + this.index_y * this.number_of_pixels * this.pixel_size + i * this.pixel_size - this.pixel_size / 2 + 'px';
                        }
                    } else if (j === 1 || j === 4) {
                        div.style.left = leftMargin + this.index_y * this.number_of_pixels * this.pixel_size + i * this.pixel_size - this.pixel_size + 'px';
                        div.style.width = this.pixel_size * 3 + 'px';
                        div.style.height = this.pixel_size / 2 + 'px';
                    }
                } else {
                    div.style.width = this.pixel_size + 'px';
                    div.style.height = this.pixel_size + 'px';
                }
                switch (this.type) {
                    case ".":
                        block.draw_non_crashed_block(div);
                        break;
                    case "_":
                        block.draw_Crashed_block(div, i, j);
                        break;
                    case "|":
                        block.draw_ladder(div, i, j);
                        break;
                    case "-":
                        this.draw_rope(div, j);
                        break;
                    default:
                        this.draw_empty(div, i, j);
                        break;
                }
            }
        }
        return this.type;
    }

    static draw_non_crashed_block(div) {
        div.className = 'cell non_crashed_cell';
    }

    draw_empty(div, i, j) {
        if (this.cake && i !== 0) {
            if (j === 5) {
                div.className = 'cell empty_cell';
            } else if (j % 2 === 0) {
                div.className = "cell white_cell";
            } else if (j % 2 !== 0) {
                div.className = "cell red_cake_cell";
            } else {
                div.className = 'cell empty_cell';
            }
        } else {
            div.className = 'cell empty_cell';
        }
    }

    static draw_Crashed_block(div, i, j) {
        if (j === 5) {
            div.className = 'cell empty_cell';
        } else if (i <= 2 && j <= 1) {
            div.className = 'cell crashed_block';
        } else if (i >= 3 && j >= 3) {
            div.className = 'cell crashed_block';
        } else if (i === 5 && j <= 1) {
            div.className = 'cell crashed_block';
        } else if (j >= 3 && i === 0) {
            div.className = 'cell crashed_block'
        } else {
            div.className = 'cell empty_cell';
        }
    }

    static draw_ladder(div, i, j) {
        if (i === 1 || i === 4 || ((j === 1 || j === 4)) && i !== 0 && i !== 5) {
            div.className = 'cell white_cell';
        }
    }

    draw_rope(div, j) {
        if (j === 0) {
            div.className = 'cell white_cell';
            div.style.height = this.pixel_size / 2 + 'px';
        } else {
            div.className = 'cell empty_cell';
        }
    }
}

class mob {
    constructor(level, is_main_hero, index_x, index_y) {
        this.is_main_hero = is_main_hero;
        this.have_cake = false;
        this.level = level;
        this.x = index_x;
        this.y = index_y;
        this.state = 0;
        this.number_of_pixels = 10;
        this.pixel_size = 3.6;
        this.direction = Lode_runner.Direction.Right;
        this.right_states = this.get_right_states();
        this.left_states = this.get_left_states();
        this.ladder_states = this.get_ladder_states();
        this.down_state = this.get_down_state();
        this.rope_left_states = this.get_rope_left_states();
        this.rope_right_states = this.get_rope_right_states();
        this.leftMargin = 0;
        this.topMargin = 0;
        this.not_block = false;
        this.pixels = initialize_empty_array(this.number_of_pixels);
    }

    identificate_mob() {
        if (this.is_main_hero) {
            return 'cell hero';
        } else {
            return 'cell mob';
        }
    }

    identificate_right_steps(i, j, number_of_step) {
        let delta = 0;
        if (number_of_step === 0) {
            delta = 0;
        } else if (number_of_step === 1 || number_of_step === 2) {
            delta = number_of_step;
        } else {
            delta = number_of_step - 5;
        }
        if (j === 0 && i === (5 + delta)) {
            if (!this.is_main_hero && this.have_cake) {
                return 'cell mob_with_cake';
            } else {
                return 'cell hero_head';
            }
        } else if (j >= 1 && j <= 2 && i >= (4 + delta) && i <= (6 + delta)) {
            return this.identificate_mob();
        }
        if (number_of_step === 0) {
            if (j === 3 && i >= 3 && i <= 5) {
                return this.identificate_mob();
            } else if (j === 4 && i >= 1 && i <= 6 && i !== 3) {
                return this.identificate_mob();
            } else if (j === 5 && i >= 0 && i <= 8 && i !== 2 && i !== 5 && i !== 6) {
                return this.identificate_mob();
            } else if (j >= 6 && j <= 7 && i >= 3 && i <= 4) {
                return 'cell hero';
            }
            if (j === 7 && i === 5) {
                return 'cell hero';
            } else if (j === 8 && i >= 0 && i <= 6 && i !== 4) {
                return 'cell hero';
            } else if (j === 9 && (i === 5 || i === 6)) {
                return 'cell hero';
            }
        } else if (number_of_step === 1 || number_of_step === 3) {
            if (number_of_step === 1) {
                delta = 1;
            }
            if (j === 3 && i >= (4 + delta) && i <= (5 + delta)) {
                return this.identificate_mob();
            } else if (j === 4 && i >= (3 + delta) && i <= (5 + delta)) {
                return this.identificate_mob();
            } else if (j === 5 && i >= (2 + delta) && i <= (6 + delta)) {
                return this.identificate_mob();
            } else if (j === 6 && i >= (2 + delta) && i <= (8 + delta) && i !== (6 + delta)) {
                return 'cell hero';
            } else if (j === 7 && i >= (4 + delta) && i <= (6 + delta)) {
                return 'cell hero';
            } else if (j === 8 && i >= (2 + delta) && i <= (5 + delta)) {
                return 'cell hero';
            } else if (j === 9 && i >= (3 + delta) && i <= (4 + delta)) {
                return 'cell hero';
            }
        } else if (number_of_step === 2 || number_of_step === 4) {
            delta -= 1;
            if (j === 3 && i >= (5 + delta) && i <= (6 + delta)) {
                return this.identificate_mob();
            } else if (j === 4 && ((i >= (3 + delta) && i <= (6 + delta)) || (i === 8 + delta))) {
                return this.identificate_mob();
            } else if (j === 5 && i >= (2 + delta) && i <= (8 + delta) && i !== (4 + delta)) {
                return this.identificate_mob();
            } else if (j === 6 && i >= (5 + delta) && i <= (6 + delta)) {
                return 'cell hero';
            } else if (j === 7 && i >= (4 + delta) && i <= (7 + delta)) {
                return 'cell hero';
            } else if (j === 8 && i >= (3 + delta) && i <= (8 + delta) && i !== (5 + delta) && i !== (6 + delta)) {
                return 'cell hero';
            } else if (j === 9 && ((i >= (2 + delta) && i <= (3 + delta)) || (i >= (7 + delta) && i <= (8 + delta)))) {
                return 'cell hero';
            }
        }
    }

    get_right_states() {
        let new_arr = new Array(5);
        for (let step = 0; step < new_arr.length; ++step) {
            let arr = new Array(this.number_of_pixels);
            for (let i = 0; i < arr.length; ++i) {
                arr[i] = new Array(this.number_of_pixels);
                for (let j = 0; j < arr.length; ++j) {
                    arr[i][j] = this.identificate_right_steps(i, j, step)
                }
            }
            new_arr[step] = arr;
        }
        return new_arr;
    }

    get_left_states() {
        let new_arr = new Array(5);
        for (let step = 0; step < new_arr.length; ++step) {
            let arr = new Array(this.number_of_pixels);
            for (let i = 0; i < arr.length; ++i) {
                arr[i] = new Array(this.number_of_pixels);
                for (let j = 0; j < arr.length; ++j) {
                    arr[i][j] = this.right_states[step][this.number_of_pixels - 1 - i][j];
                }
            }
            new_arr[step] = arr;
        }
        return new_arr;
    }

    get_ladder_states() {
        let new_arr = new Array(2);
        let arr = new Array(this.number_of_pixels);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = new Array(this.number_of_pixels);
            for (let j = 0; j < arr.length; ++j) {
                if (j === 0 && i >= 4 && i <= 5) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 1 && i <= 5 && i !== 2 && i !== 3) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 2 && i <= 5) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 3 && i >= 3 && i <= 9 && i !== 6 && i !== 7) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 4 && i >= 3 && i <= 9) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 5 && i >= 3 && i <= 5) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 6 && i >= 3 && i <= 5) {
                    arr[i][j] = 'cell hero';
                } else if (j >= 7 && j <= 8 && i >= 2 && i <= 6 && i !== 4) {
                    arr[i][j] = 'cell hero';
                } else if (j === 9 && i >= 5 && i <= 6) {
                    arr[i][j] = 'cell hero';
                }
            }
        }
        new_arr[0] = arr;
        new_arr[1] = new Array(this.number_of_pixels);
        for (let i = 0; i < this.number_of_pixels; ++i) {
            new_arr[1][i] = new Array(this.number_of_pixels);
            for (let j = 0; j < this.number_of_pixels; ++j) {
                new_arr[1][i][j] = arr[this.number_of_pixels - 1 - i][j];
            }
        }
        return new_arr;
    }

    get_down_state() {
        let arr = new Array(this.number_of_pixels);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = new Array(this.number_of_pixels);
            for (let j = 0; j < arr.length; ++j) {
                if (j === 0 && (i <= 1 || (i >= 7 && i <= 8))) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 0 && i === 4) {
                    if (!this.is_main_hero && this.have_cake) {
                        arr[i][j] = 'cell mob_with_cake';
                    } else {
                        arr[i][j] = 'cell hero_head';
                    }
                } else if (j >= 1 && j <= 2 && i <= 8 && i !== 2 && i !== 6) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 3 && i >= 1 && i <= 7) {
                    arr[i][j] = this.identificate_mob();
                } else if (j >= 4 && i >= 3 && i <= 4) {
                    if (j <= 5) {
                        arr[i][j] = this.identificate_mob();
                    } else {
                        arr[i][j] = 'cell hero';
                    }
                }
                if (j === 6 && i <= 8 && i >= 5 && i <= 7) {
                    arr[i][j] = 'cell hero';
                } else if (j >= 7 && j <= 8 && i >= 6 && i <= 7) {
                    arr[i][j] = 'cell hero';
                }
            }
        }
        return arr;
    }

    get_rope_right_states() {
        let new_arr = new Array(3);
        for (let step = 0; step < new_arr.length; ++step) {
            let arr = new Array(this.number_of_pixels);
            for (let i = 0; i < arr.length; ++i) {
                arr[i] = new Array(this.number_of_pixels);
                for (let j = 0; j < arr.length; ++j) {
                    arr[i][j] = this.rope_left_states[step][this.number_of_pixels - 1 - i][j];
                }
            }
            new_arr[step] = arr;
        }
        return new_arr;
    }

    get_rope_left_states() {
        let new_arr = new Array(3);
        let arr = new Array(this.number_of_pixels);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = new Array(this.number_of_pixels);
            for (let j = 0; j < arr.length; ++j) {
                if (j >= 0 && j <= 1 && i >= 1 && i <= 2) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 2 && i >= 1 && i <= 4) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 3 && i >= 2 && i <= 4) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 4 && i >= 3 && i <= 6) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 5 && i >= 3 && i <= 7 && i !== 5) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 6 && i >= 3 && i <= 4) {
                    arr[i][j] = 'cell hero';
                } else if (j === 7 && i >= 3 && i <= 5) {
                    arr[i][j] = 'cell hero';
                } else if (j === 8 && i >= 2 && i <= 6 && i !== 4) {
                    arr[i][j] = 'cell hero';
                } else if (j === 9 && i >= 2 && i <= 3) {
                    arr[i][j] = 'cell hero';
                }
            }
        }
        new_arr[0] = arr;
        new_arr[2] = new Array(this.number_of_pixels);
        for (let i = 0; i < this.number_of_pixels; ++i) {
            new_arr[2][i] = new Array(this.number_of_pixels);
            for (let j = 0; j < this.number_of_pixels; ++j) {
                new_arr[2][i][j] = arr[this.number_of_pixels - 1 - i][j];
            }
        }
        arr = new Array(this.number_of_pixels);
        for (let i = 0; i < this.number_of_pixels; ++i) {
            arr[i] = new Array(this.number_of_pixels);
            for (let j = 0; j < this.number_of_pixels; ++j) {
                if (j >= 0 && j <= 2 && ((i >= 0 && i <= 1) || (i >= 6 && i <= 7))) {
                    arr[i][j] = this.identificate_mob();
                }
                if (j === 2 && i >= 3 && i <= 4) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 3 && i >= 1 && i <= 7 && i !== 5) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 4 && i >= 3 && i <= 6) {
                    arr[i][j] = this.identificate_mob();
                } else if (j >= 5 && j <= 6 && i >= 4 && i <= 5) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 7 && i >= 4 && i <= 7) {
                    arr[i][j] = 'cell hero';
                } else if (j === 8 && ((i >= 7 && i <= 8) || i === 4)) {
                    arr[i][j] = 'cell hero';
                } else if (j === 9 && i >= 4 && i <= 8 && i !== 6) {
                    arr[i][j] = 'cell hero';
                }
            }
        }
        new_arr[1] = arr;
        return new_arr;
    }

    draw(doc) {
        this.pixel_size = this.level[0][0].pixel_size * 6 / 10;
        for (let i = 0; i < this.number_of_pixels; ++i) {
            for (let j = 0; j < this.number_of_pixels; ++j) {
                let div = this.pixels[i][j];
                if (div === null) {
                    div = doc.createElement('div');
                    doc.body.appendChild(div);
                    this.pixels[i][j] = div;
                }
                div.style.width = this.pixel_size + 'px';
                div.style.height = this.pixel_size + 'px';
                div.style.left = this.leftMargin + this.y * this.level[0][0].number_of_pixels * this.level[0][0].pixel_size + i * this.pixel_size + 'px';
                div.style.top = this.topMargin + (this.x * this.level[0][0].number_of_pixels * this.level[0][0].pixel_size + j * this.pixel_size) + 'px';
                if (this.direction === Lode_runner.Direction.Right && !this.not_block) {
                    div.className = this.right_states[this.state][i][j];
                } else if (this.direction === Lode_runner.Direction.Left && !this.not_block) {
                    div.className = this.left_states[this.state][i][j];
                } else if ((this.direction === Lode_runner.Direction.Up || this.direction === Lode_runner.Direction.Down) && !this.not_block) {
                    div.className = this.ladder_states[this.state % 2][i][j];
                } else if (this.direction === Lode_runner.Direction.Down && this.not_block) {
                    div.className = this.down_state[i][j];
                } else if (this.direction === Lode_runner.Direction.Left && this.not_block) {
                    div.className = this.rope_left_states[this.state % 3][i][j];
                } else if (this.direction === Lode_runner.Direction.Right && this.not_block) {
                    div.className = this.rope_right_states[this.state % 3][i][j];
                }
            }
        }
    }
}

let initialize_empty_array = function (number_of_pixels) {
    let arr = new Array(number_of_pixels);
    for (let index = 0; index < number_of_pixels; ++index) {
        arr[index] = new Array(number_of_pixels);
        for (let y = 0; y < number_of_pixels; ++y) {
            arr[index][y] = null;
        }
    }
    return arr;
};

let processing_lvl = function (text) {
    let level = new Array(text.length);
    let enemies = [];
    let main_hero = null;
    for (let i = 0; i < text.length; ++i) {
        level[i] = new Array(text[i].length);
        for (let j = 0; j < text[i].length; ++j) {
            level[i][j] = new block(text[i][j], i, j, text.length);
            if (text[i][j] === '^') {
                enemies.push(new mob(level, false, i, j));
            } else if (text[i][j] === 'H') {
                main_hero = new mob(level, true, i, j);
            }
        }
    }
    return [level, enemies, main_hero];
};

let read_level_from_file = function (name_of_file) {
    /*The only working version of reading data from a txt file that I found.
    Copied from here https://www.quora.com/What-is-the-way-to-have-Javascript-read-from-a-txt-file.
    Copied because I don't consider it the basis for my game.*/
    let rawFile = new XMLHttpRequest();
    let text = "";
    rawFile.open("GET", name_of_file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                text = rawFile.responseText;
            }
        }
    };
    rawFile.send(null);
    return text;
};

// Configuration
Lode_runner.Config = function (text) {
    // Box size in pixels
    this.number_of_pixels_in_one_grid = 5;
    let field = processing_lvl(text.split('\n'));
    this.level = field[0];
    this.enemies = field[1];
    this.start_field = text;
    this.leftMargin = 0;
    this.topMargin = 0;
    this.main_hero = field[2];
    this.window_width = window.innerWidth;
    this.window_height = window.innerHeight;
    this.field_painted = false;
    this.length = this.level.length * this.number_of_pixels_in_one_grid;
};

// Initial game state
Lode_runner.State = function () {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.ticks = 0;
    this.paused = false;
    this.direction = 0;
    this.lastKeyTick = 0;
    this.gameOver = false;
    this.loopIntervalMillis = 67.5;
};

// Const keycodes
Lode_runner.Direction = {
    Up: 38,
    Down: 40,
    Left: 37,
    Right: 39,
};

Lode_runner.KeyCode = {
    Pause: 80,
    Resume: 82,
};

// Game engine
Lode_runner.Game = function (doc, wnd, field) {
    this.config = new Lode_runner.Config(field);
    this.state = new Lode_runner.State();
    doc.onkeydown = this.onkeydown.bind(this);
    doc.onkeyup = this.onkeyup.bind(this);

    this.doc = doc;
    this.wnd = wnd;

    // Force first loop, to make game more responsive at first
    this.loop();
};

Lode_runner.Game.prototype.stateDescription = function () {
    if (this.state.gameOver) {
        return "GAME OVER (RELOAD PAGE TO START OVER)";
    }
    if (this.state.paused) {
        return "PAUSED (PRESS R TO RESUME)";
    }
    return "PRESS P TO PAUSE";
};

Lode_runner.Game.prototype.drawHUD = function () {
    this.doc.getElementById("level").innerHTML = this.state.level;
    this.doc.getElementById("score").innerHTML = this.state.score;
    this.doc.getElementById("lives").innerHTML = this.state.lives;
    this.doc.getElementById("state").innerHTML = this.stateDescription();
};

Lode_runner.Game.prototype.draw = function () {
    if (this.config.window_width !== window.innerWidth || this.config.window_height !== window.innerHeight) {
        this.state.paused = true;
    }

    this.drawHUD();

    if (this.state.gameOver) {
        return;
    }
    if (!this.config.field_painted || this.config.window_width !== window.innerWidth || this.config.window_height !== window.innerHeight) {
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
        this.config.window_width = window.innerWidth;
        this.config.window_height = window.innerHeight;
        this.state.paused = false;
    }
};

Lode_runner.Game.prototype.draw_enemies = function () {
    for (let i = 0; i < this.config.enemies.length; ++i) {
        this.config.enemies[i].draw(this.doc);
    }
};

Lode_runner.Game.prototype.draw_main_hero = function () {
    this.config.main_hero.draw(this.doc);
};

Lode_runner.Game.prototype.check_available_cell = function (cell) {
    return !(this.config.level[this.config.main_hero.x][this.config.main_hero.y + cell].type === '.' || this.config.level[this.config.main_hero.x][this.config.main_hero.y + cell].type === '_');

};

Lode_runner.Game.prototype.move_main_hero_right = function () {
    if (!this.check_available_cell(1)) {
        return;
    }
    this.config.main_hero.not_block = false;
    if (this.last_position !== Lode_runner.Direction.Right) {
        this.config.main_hero.leftMargin = this.config.leftMargin;
        this.config.main_hero.state = -1;
        this.last_position = Lode_runner.Direction.Right;
    }
    this.config.main_hero.topMargin = this.config.topMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Right;
    this.config.main_hero.state += 1;
    this.config.main_hero.leftMargin += this.config.level[0][0].pixel_size * 6 / 10;
    if (this.config.main_hero.state === 3) {
        this.config.main_hero.y += 1;
        this.config.main_hero.leftMargin = this.config.leftMargin - 2 * this.config.level[0][0].pixel_size * 6 / 10;
    }
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.state = 0;
        this.config.main_hero.leftMargin = this.config.leftMargin;
    }
};

Lode_runner.Game.prototype.move_main_hero_left = function () {
    if (!this.check_available_cell(-1)) {
        return;
    }
    this.config.main_hero.not_block = false;
    if (this.last_position !== Lode_runner.Direction.Left) {
        this.config.main_hero.leftMargin = this.config.leftMargin;
        this.config.main_hero.state = -1;
        this.last_position = Lode_runner.Direction.Left;
    }
    this.config.main_hero.state += 1;
    this.config.main_hero.topMargin = this.config.topMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Left;
    this.config.main_hero.leftMargin -= this.config.level[0][0].pixel_size * 6 / 10;
    if (this.config.main_hero.state === 3) {
        this.config.main_hero.y -= 1;
        this.config.main_hero.leftMargin = this.config.leftMargin + 2 * this.config.level[0][0].pixel_size * 6 / 10;
    }
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.state = 0;
        this.config.main_hero.leftMargin = this.config.leftMargin;
    }
};

Lode_runner.Game.prototype.move_main_hero_down = function () {
    this.config.main_hero.not_block = true;
    this.config.main_hero.leftMargin = this.config.leftMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Down;
    if (this.last_position !== Lode_runner.Direction.Down) {
        this.config.main_hero.state = 0;
    }
    this.config.main_hero.topMargin = this.config.topMargin + this.config.main_hero.state * this.config.level[0][0].pixel_size * 12 / 10;
    this.config.main_hero.state += 1;
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.x += 1;
        this.config.main_hero.state = 0;
        this.toDown = false;
        this.config.main_hero.topMargin = this.config.topMargin;
    }
    this.last_position = Lode_runner.Direction.Down;
};

Lode_runner.Game.prototype.move_main_hero_up_ladder = function () {
    this.config.main_hero.not_block = false;
    this.config.main_hero.leftMargin = this.config.leftMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Up;
    if (this.last_position !== Lode_runner.Direction.Up) {
        this.config.main_hero.state = 0;
    }
    this.config.main_hero.topMargin = this.config.topMargin - this.config.main_hero.state * this.config.level[0][0].pixel_size * 12 / 10;
    this.config.main_hero.state += 1;
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.x -= 1;
        this.config.main_hero.state = 0;
        this.config.main_hero.topMargin = this.config.topMargin;
    }
    this.last_position = Lode_runner.Direction.Up;
};

Lode_runner.Game.prototype.move_main_hero_down_ladder = function () {
    this.config.main_hero.not_block = false;
    this.config.main_hero.leftMargin = this.config.leftMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Down;
    if (this.last_position !== Lode_runner.Direction.Down) {
        this.config.main_hero.state = 0;
    }
    this.config.main_hero.topMargin = this.config.topMargin + this.config.main_hero.state * this.config.level[0][0].pixel_size * 12 / 10;
    this.config.main_hero.state += 1;
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.x += 1;
        this.config.main_hero.state = 0;
        this.config.main_hero.topMargin = this.config.topMargin;
    }
    this.last_position = Lode_runner.Direction.Down;
};

Lode_runner.Game.prototype.move_main_hero_left_rope = function () {
    this.config.main_hero.topMargin = this.config.topMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Left;
    if (this.last_position !== Lode_runner.Direction.Left || !this.config.main_hero.not_block) {
        this.config.main_hero.state = 0;
    }
    this.config.main_hero.not_block = true;
    this.config.main_hero.leftMargin = this.config.leftMargin - this.config.main_hero.state * this.config.level[0][0].pixel_size * 12 / 10;
    this.config.main_hero.state += 1;
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.y -= 1;
        this.config.main_hero.state = 0;
        this.config.main_hero.leftMargin = this.config.leftMargin;
    }
    this.last_position = Lode_runner.Direction.Left;
};

Lode_runner.Game.prototype.move_main_hero_right_rope = function () {
    this.config.main_hero.topMargin = this.config.topMargin;
    this.config.main_hero.direction = Lode_runner.Direction.Right;
    if (this.last_position !== Lode_runner.Direction.Right || !this.config.main_hero.not_block) {
        this.config.main_hero.state = 0;
    }
    this.config.main_hero.not_block = true;
    this.config.main_hero.leftMargin = this.config.leftMargin + this.config.main_hero.state * this.config.level[0][0].pixel_size * 12 / 10;
    this.config.main_hero.state += 1;
    if (this.config.main_hero.state === 5) {
        this.config.main_hero.y += 1;
        this.config.main_hero.state = 0;
        this.config.main_hero.leftMargin = this.config.leftMargin;
    }
    this.last_position = Lode_runner.Direction.Right;
};

Lode_runner.Game.prototype.check_game_status = function () {
    if (this.config.level[this.config.main_hero.x][this.config.main_hero.y].cake) {
        this.state.score += 1000;
        this.config.level[this.config.main_hero.x][this.config.main_hero.y].cake = false;
        this.config.level[this.config.main_hero.x][this.config.main_hero.y].draw(this.doc, this.topMargin, this.leftMargin);
    }
    for (let index = 0; index < this.config.enemies.length; ++index) {
        if (this.config.enemies[index].x === this.config.main_hero.x && this.config.enemies[index].y === this.config.main_hero.y) {
            this.state.lives -= 1;
            this.config = new Lode_runner.Config(this.config.start_field);
            alert('You died!:)');
        }
    }
};

Lode_runner.Game.prototype.update_main_hero = function () {
    if (this.state.paused) {
        return;
    }
    let current_cell = this.config.level[this.config.main_hero.x][this.config.main_hero.y].type;
    let current_down_cell = this.config.level[this.config.main_hero.x + 1][this.config.main_hero.y].type;
    if (current_cell !== '-' && current_cell !== '|' && (current_down_cell === ' ' || current_down_cell === '-')) {
        this.move_main_hero_down();
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
        this.last_position = Lode_runner.Direction.Right;
    } else if (this.state.direction === Lode_runner.Direction.Left) {
        if (current_cell === '-') {
            this.move_main_hero_left_rope();
        } else {
            this.move_main_hero_left();
        }
        this.last_position = Lode_runner.Direction.Left;
    } else if (current_cell === '-' && (this.state.direction === Lode_runner.Direction.Down || this.toDown)) {
        this.toDown = true;
        this.move_main_hero_down();
    }
};

Lode_runner.Game.prototype.onkeydown = function (event) {
    let code = event.keyCode;
    if (Lode_runner.Direction.Up === code || Lode_runner.Direction.Down === code || Lode_runner.Direction.Left === code || Lode_runner.Direction.Right === code) {
        event.preventDefault();
    }
    if (this.state.gameOver) {
        return;
    }
    if (this.state.lastKeyTick === this.state.ticks) {
        // Dont allow multiple keys in same tick
        return;
    }
    if ((Lode_runner.Direction.Up === code && Lode_runner.Direction.Down !== this.state.direction)
        || (Lode_runner.Direction.Down === code && Lode_runner.Direction.Up !== this.state.direction)
        || (Lode_runner.Direction.Left === code && Lode_runner.Direction.Right !== this.state.direction)
        || (Lode_runner.Direction.Right === code && Lode_runner.Direction.Left !== this.state.direction)) {
        this.state.direction = code;
        this.state.lastKeyTick = this.state.ticks;
    } else if (Lode_runner.KeyCode.Pause === code) {
        this.state.paused = true;
    } else if (Lode_runner.KeyCode.Resume === code) {
        this.state.paused = false;
    }
    return true;
};

Lode_runner.Game.prototype.onkeyup = function (event) {
    this.state.direction = 0;
};

Lode_runner.Game.prototype.loop = function () {
    this.draw();
    this.draw_enemies();
    this.draw_main_hero();
    this.update_main_hero();
    this.check_game_status();
    this.state.ticks = this.state.ticks + 1;
    this.wnd.setTimeout(this.loop.bind(this), this.state.loopIntervalMillis);
};

// Start game
let text = null;
try {
    text = read_level_from_file("./levels/level1.txt");
} catch (error) {
    let text = '...................................\n' +
        '.                                 .\n' +
        '.     *        ^                  .\n' +
        '.________|_________               .\n' +
        '.        |------------    *       .\n' +
        '.        |    __|     ________|___.\n' +
        '.        |    __|             |   .\n' +
        '.        |    __|             |   .\n' +
        '.     ^  |    __|             |   .\n' +
        '.__|______    ________|___________.\n' +
        '.  |                  |           .\n' +
        '.  |                  |           .\n' +
        '.  |           H      |           .\n' +
        '._________|___________|           .\n' +
        '.         |           |           .\n' +
        '.         |           |           .\n' +
        '.       * |-----------|    ^ *    .\n' +
        '.   |_______          ___________|.\n' +
        '.   |  ^            *        ^   |.\n' +
        '._________________________________.\n' +
        '...................................\n';
}
document.game = new Lode_runner.Game(document, window, text);