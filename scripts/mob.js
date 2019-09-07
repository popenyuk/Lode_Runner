import {initialize_empty_array} from './additional_functions'

let Lode_runner = {};

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

export class mob {
    constructor(level, is_main_hero, index_x, index_y) {
        // identifies mob or main hero
        this.is_main_hero = is_main_hero;

        // identifies whether the mob has a cake or not
        this.have_cake = false;

        // save level
        this.level = level;

        // coordinates of mob
        this.x = index_x;
        this.y = index_y;

        // current state
        this.state = 0;

        // number of pixels in main hero
        this.number_of_pixels = 10;

        // size of one pixel
        this.pixel_size = 3.6;

        // current direction and last direction
        this.direction = Lode_runner.Direction.Right;
        this.last_direction = Lode_runner.Direction.Right;

        // 3d arrays with animation of mob
        this.right_states = this.get_right_states();
        this.left_states = this.get_left_states();
        this.ladder_states = this.get_ladder_states();
        this.down_state = this.get_down_state();
        this.rope_left_states = this.get_rope_left_states();
        this.rope_right_states = this.get_rope_right_states();

        // left and top margin
        this.leftMargin = 0;
        this.topMargin = 0;

        // identifies if cell is block or rope or ladder
        this.not_block = false;

        // jump down or not
        this.toDown = false;

        // 2d array to safe current image of mob
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
        // a separate function to identify the animation of mob movement to the right
        let delta = 0;
        if (number_of_step === 0) {
            delta = 0;
        } else if (number_of_step === 1 || number_of_step === 2) {
            delta = number_of_step;
        } else {
            delta = number_of_step - 5;
        }
        if (j === 0 && i === (5 + delta)) {
            return 'cell hero_head';
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
        // function for getting mob movement to the right
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
        // function for getting mob movement to the left
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
        // function for getting mob movement on the ladder
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
        // // function for getting mob movement to jump down
        let arr = new Array(this.number_of_pixels);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = new Array(this.number_of_pixels);
            for (let j = 0; j < arr.length; ++j) {
                if (j === 0 && (i <= 1 || (i >= 7 && i <= 8))) {
                    arr[i][j] = this.identificate_mob();
                } else if (j === 0 && i === 4) {
                    arr[i][j] = 'cell hero_head';
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
        // function for getting mob movement to the right on rope
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
        // function for getting mob movement to the left on rope
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
        // function for drawwing mob
        this.pixel_size = this.level[0][0].pixel_size * 6 / 10;
        for (let i = 0; i < this.number_of_pixels; ++i) {
            for (let j = 0; j < this.number_of_pixels; ++j) {
                // getting element from array
                let div = this.pixels[i][j];
                // creating new element, if old is empty
                if (div === null) {
                    div = doc.createElement('div');
                    doc.body.appendChild(div);
                    this.pixels[i][j] = div;
                }

                // establishing the basic characteristics of the element
                div.style.width = this.pixel_size + 'px';
                div.style.height = this.pixel_size + 'px';
                div.style.left = this.leftMargin + this.y * this.level[0][0].number_of_pixels * this.level[0][0].pixel_size + i * this.pixel_size + 'px';
                div.style.top = this.topMargin + (this.x * this.level[0][0].number_of_pixels * this.level[0][0].pixel_size + j * this.pixel_size) + 'px';

                // getting postion of pixels instead of animation
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

                if (div.className === "cell hero_head" && this.have_cake) {
                    div.className = "cell mob_with_cake";
                }

                // remove element f it is empty
                if (div.className === undefined) {
                    doc.body.removeChild(this.pixels[i][j]);
                    this.pixels[i][j] = null;
                }
            }
        }
    }

    delete(doc) {
        // delete mob from page
        for (let i = 0; i < this.number_of_pixels; ++i) {
            for (let j = 0; j < this.number_of_pixels; ++j) {
                if (this.pixels[i][j] !== null && this.pixels[i][j] !== undefined) {
                    doc.body.removeChild(this.pixels[i][j]);
                    this.pixels[i][j] = null;
                }
            }
        }
    }

    move_right(leftMargin, topMargin) {
        // right motion animation
        this.not_block = false;

        // check last characteristic's of mob, change it to default
        if (this.last_position !== Lode_runner.Direction.Right) {
            this.leftMargin = leftMargin;
            this.state = -1;
            this.last_position = Lode_runner.Direction.Right;
        }
        this.topMargin = topMargin;
        this.direction = Lode_runner.Direction.Right;
        this.state += 1;
        this.leftMargin += this.level[0][0].pixel_size * 6 / 10;

        // check extreme cases
        if (this.state === 3) {
            this.y += 1;
            this.leftMargin = leftMargin - 2 * this.level[0][0].pixel_size * 6 / 10;
        }
        if (this.state === 5) {
            this.state = 0;
            this.leftMargin = leftMargin;
        }
    }

    move_left(leftMargin, topMargin) {
        // left motion animation
        this.not_block = false;
        if (this.last_position !== Lode_runner.Direction.Left) {
            this.leftMargin = leftMargin;
            this.state = -1;
            this.last_position = Lode_runner.Direction.Left;
        }
        this.state += 1;
        this.topMargin = topMargin;
        this.direction = Lode_runner.Direction.Left;
        this.leftMargin -= this.level[0][0].pixel_size * 6 / 10;
        if (this.state === 3) {
            this.y -= 1;
            this.leftMargin = leftMargin + 2 * this.level[0][0].pixel_size * 6 / 10;
        }
        if (this.state === 5) {
            this.state = 0;
            this.leftMargin = leftMargin;
        }
    }

    move_down(leftMargin, topMargin) {
        // down motion animation
        this.not_block = true;
        this.leftMargin = leftMargin;
        this.direction = Lode_runner.Direction.Down;
        if (this.last_position !== Lode_runner.Direction.Down) {
            this.state = 0;
        }
        this.topMargin = topMargin + this.state * this.level[0][0].pixel_size * 12 / 10;
        this.state += 1;
        if (this.state === 5) {
            this.x += 1;
            this.state = 0;
            this.toDown = false;
            this.topMargin = topMargin;
        }
        this.last_position = Lode_runner.Direction.Down;
    }

    move_up_ladder(leftMargin, topMargin) {
        // up ladder motion animation
        this.not_block = false;
        this.leftMargin = leftMargin;
        this.direction = Lode_runner.Direction.Up;
        if (this.last_position !== Lode_runner.Direction.Up) {
            this.state = 0;
        }
        this.topMargin = topMargin - this.state * this.level[0][0].pixel_size * 12 / 10;
        this.state += 1;
        if (this.state === 5) {
            this.x -= 1;
            this.state = 0;
            this.topMargin = topMargin;
        }
        this.last_position = Lode_runner.Direction.Up;
    }

    move_down_ladder(leftMargin, topMargin) {
        // down ladder motion animation
        this.not_block = false;
        this.leftMargin = leftMargin;
        this.direction = Lode_runner.Direction.Down;
        if (this.last_position !== Lode_runner.Direction.Down) {
            this.state = 0;
        }
        this.topMargin = topMargin + this.state * this.level[0][0].pixel_size * 12 / 10;
        this.state += 1;
        if (this.state === 5) {
            this.x += 1;
            this.state = 0;
            this.topMargin = topMargin;
        }
        this.last_position = Lode_runner.Direction.Down;
    }

    move_left_rope(leftMargin, topMargin) {
        // left rope motion animation
        this.topMargin = topMargin;
        this.direction = Lode_runner.Direction.Left;
        if (this.last_position !== Lode_runner.Direction.Left || !this.not_block) {
            this.state = 0;
        }
        this.not_block = true;
        this.leftMargin = leftMargin - this.state * this.level[0][0].pixel_size * 12 / 10;
        this.state += 1;
        if (this.state === 5) {
            this.y -= 1;
            this.state = 0;
            this.leftMargin = leftMargin;
        }
        this.last_position = Lode_runner.Direction.Left;
    }

    move_right_rope(leftMargin, topMargin) {
        // right rope motion animation
        this.topMargin = topMargin;
        this.direction = Lode_runner.Direction.Right;
        if (this.last_position !== Lode_runner.Direction.Right || !this.not_block) {
            this.state = 0;
        }
        this.not_block = true;
        this.leftMargin = leftMargin + this.state * this.level[0][0].pixel_size * 12 / 10;
        this.state += 1;
        if (this.state === 5) {
            this.y += 1;
            this.state = 0;
            this.leftMargin = leftMargin;
        }
        this.last_position = Lode_runner.Direction.Right;
    }

    mob_move(main_hero, leftMargin, topMargin, enemies) {
        // the main logic of the movement of mobs
        // some data needed to check next movement of mob
        let current_cell = this.level[this.x][this.y].type;
        let current_right_cell = this.level[this.x][this.y + 1].type;
        let current_left_cell = this.level[this.x][this.y - 1].type;
        let current_down_cell = this.level[this.x + 1][this.y].type;
        let up_cell_is_available = true;
        let down_cell_is_available = true;
        let left_cell_is_available = true;
        let right_cell_is_available = true;

        // check if adjacent cells are accessible
        for (let index = 0; index < enemies.length; ++index) {
            if (this.x === enemies[index].x && (this.y + 1) === enemies[index].y) {
                right_cell_is_available = false;
            } else if (this.x === enemies[index].x && (this.y - 1) === enemies[index].y) {
                left_cell_is_available = false;
            } else if ((this.x - 1) === enemies[index].x && this.y === enemies[index].y) {
                up_cell_is_available = false;
            } else if ((this.x + 1) === enemies[index].x && this.y === enemies[index].y) {
                down_cell_is_available = false;
            }
        }

        if (this.level[this.x][this.y].crashed && !this.level[this.x][this.y].have_mob) {
            // check if down block is crashed
            this.level[this.x][this.y].have_mob = true;
            this.state = 0;
        } else if (this.level[this.x][this.y].have_mob) {
            // animation of getting  mob off from gap
            if (this.state < 10) {
                this.state += 1;
            } else {
                let last_state = this.state;
                this.state -= 10;
                if (this.state <= 5) {
                    if (up_cell_is_available) {
                        this.move_up_ladder(leftMargin, topMargin);
                        this.state = last_state + 1;
                    }
                }
            }
        } else if (((current_cell !== '-' && current_cell !== '|' && (current_down_cell === ' ' || current_down_cell === '-' || current_down_cell === 'E')) || this.toDown) && !this.level[this.x + 1][this.y].have_mob) {
            // mob jump down
            this.toDown = true;
            this.move_down(leftMargin, topMargin);
        } else {
            // main logic of movement of the mob
            if (this.x === main_hero.x) {
                // if the main character and the mob are on the same level, then you need to move to the right or left
                if ((this.y > main_hero.y || (this.y === main_hero.y && this.last_direction === Lode_runner.Direction.Left)) && (current_left_cell !== '_' && current_left_cell !== '.')) {
                    if (left_cell_is_available) {
                        if (current_left_cell !== '-') {
                            this.move_left(leftMargin, topMargin);
                        } else {
                            this.move_left_rope(leftMargin, topMargin);
                        }
                    }
                } else if ((this.y < main_hero.y || (this.y === main_hero.y && this.last_direction === Lode_runner.Direction.Right)) && (current_right_cell !== '_' && current_right_cell !== '.')) {
                    if (right_cell_is_available) {
                        if (current_right_cell !== '-') {
                            this.move_right(leftMargin, topMargin);
                        } else {
                            this.move_right_rope(leftMargin, topMargin);
                        }
                    }
                }
            } else if (this.x > main_hero.x) {
                // if the protagonist is taller than the mob, then the mob searches for the nearest ladder to the top and moves in its direction
                let min_index = -1;
                for (let i = this.y; i > 0; --i) {
                    if (this.level[this.x][i].type === '|') {
                        min_index = i;
                        break;
                    }
                    if (this.level[this.x][i].type === '_' || this.level[this.x][i].type === '.') {
                        break;
                    }
                }
                for (let i = this.y; i < this.level[this.x].length; ++i) {
                    if (this.level[this.x][i].type === '|') {
                        if ((this.y - min_index) > (i - this.y) || min_index === -1) {
                            min_index = i;
                            break;
                        }
                        if (this.level[this.x][i].type === '_' || this.level[this.x][i].type === '.') {
                            break;
                        }
                    }
                }
                if (min_index > this.y) {
                    if (right_cell_is_available) {
                        if (current_right_cell !== '-') {
                            this.move_right(leftMargin, topMargin);
                        } else {
                            this.move_right_rope(leftMargin, topMargin);
                        }
                    }
                } else if (min_index === this.y) {
                    if (up_cell_is_available) {
                        this.move_up_ladder(leftMargin, topMargin);
                    }
                } else if (min_index < this.y && min_index !== -1) {
                    if (left_cell_is_available) {
                        if (current_left_cell !== '-') {
                            this.move_left(leftMargin, topMargin);
                        } else {
                            this.move_left_rope(leftMargin, topMargin);
                        }
                    }
                }
            } else {
                // if the main character is taller than the mob, then the mob is looking for an immediate opportunity to go down
                let min_index = -1;
                // search for the nearest failure on the left
                for (let i = this.y; i > 0; --i) {
                    if (this.level[this.x + 1][i].type === '|' || (this.level[this.x + 1][i].type === ' ' && !this.level[this.x + 1][i].type === ' '.have_mob) || (this.level[this.x][i].type === '-' && this.level[this.x + 1][i].type === ' ')) {
                        min_index = i;
                        break;
                    }
                    if (this.level[this.x][i].type === '_' || this.level[this.x][i].type === '.') {
                        break;
                    }
                }
                // search for the nearest failure on the right
                for (let i = this.y; i < this.level[this.x].length; ++i) {
                    if (this.level[this.x + 1][i].type === '|' || (this.level[this.x + 1][i].type === ' ' && !this.level[this.x + 1][i].have_mob) || (this.level[this.x][i].type === '-' && this.level[this.x + 1][i].type === ' ')) {
                        if ((this.y - min_index) > (i - this.y) || min_index === -1) {
                            min_index = i;
                            break;
                        }
                    }
                    if (this.level[this.x][i].type === '_' || this.level[this.x][i].type === '.') {
                        break;
                    }
                }
                // selecting the appropriate animation for the direction of motion
                if (min_index > this.y) {
                    if (right_cell_is_available) {
                        if (current_right_cell !== '-') {
                            this.move_right(leftMargin, topMargin);
                        } else {
                            this.move_right_rope(leftMargin, topMargin);
                        }
                    }
                } else if (min_index === this.y) {
                    if (down_cell_is_available) {
                        if (current_down_cell === '|') {
                            this.move_down_ladder(leftMargin, topMargin);
                        } else {
                            this.move_down(leftMargin, topMargin);
                            this.toDown = true;
                        }
                    }
                } else if (min_index < this.y && min_index !== -1) {
                    if (left_cell_is_available) {
                        if (current_left_cell !== '-') {
                            this.move_left(leftMargin, topMargin);
                        } else {
                            this.move_left_rope(leftMargin, topMargin);
                        }
                    }
                }
            }
        }
    }
}
