import {initialize_empty_array} from './additional_functions'

export class block {
    constructor(type, index_x, index_y, length) {
        // type of block
        this.cake = false;
        if (type === "*") {
            this.cake = true;
        } else {
            this.type = type;
        }
        if (type === 'H' || type === '^' || type === '*') {
            this.type = " ";
        }
        // coordinates of block
        this.index_x = index_x;
        this.index_y = index_y;

        // total length of level
        this.length = length;
        // is block crashed
        this.crashed = false;
        // is block had mob
        this.have_mob = false;

        // base characteristics
        this.number_of_pixels = 6;
        this.pixel_size = 6;
        this.state = 0;
        this.redraw = false;
        // initialise empty 2d array of pixels
        this.pixels = initialize_empty_array(this.number_of_pixels);
    }

    draw(doc, topMargin, leftMargin) {
        // draw level
        for (let i = 0; i < this.number_of_pixels; ++i) {
            for (let j = 0; j < this.number_of_pixels; ++j) {
                let div = this.pixels[i][j];
                // create new element if old is empty
                if (div === null) {
                    div = doc.createElement('div');
                }
                //enable basic characteristics
                div.style.left = leftMargin + this.index_y * this.number_of_pixels * this.pixel_size + i * this.pixel_size + 'px';
                div.style.top = topMargin + (this.index_x * this.number_of_pixels * this.pixel_size + j * this.pixel_size) + 'px';
                // some special case for ladder
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
                    // depending on the block, draw different
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
                    case "A":
                        this.draw_animation(div, i, j);
                        break;
                    default:
                        if (!this.crashed) {
                            // if block is not crashed
                            this.draw_empty(div, i, j);
                        } else if (this.redraw) {
                            // if block is being restored
                            if (j >= this.state) {
                                block.draw_Crashed_block(div, i, j);
                            }
                        } else {
                            // if block is crashing
                            this.draw_crashed_block(div, i, j);
                        }
                        break;
                }
                // append new element to dock
                if (this.pixels[i][j] === null && div.className !== 'cell empty_cell') {
                    doc.body.appendChild(div);
                    this.pixels[i][j] = div;
                }
                if (this.pixels[i][j] !== null && div.className === 'cell empty_cell') {
                    doc.body.removeChild(div);
                    this.pixels[i][j] = null;
                }
            }
        }
        return this.type;
    }

    static draw_non_crashed_block(div) {
        // a block that cannot be destroyed
        div.className = 'cell non_crashed_cell';
    }

    draw_empty(div, i, j) {
        // empty block
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
        // a block that can be destroyed
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
        // ladder
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

    draw_animation(div, i, j) {
        // animation of crashing blocks
        let to_print = false;
        div.style.width = this.pixel_size / 2 + 'px';
        div.style.height = this.pixel_size / 2 + 'px';
        if (this.state % 2 === 0 && this.state < 4) {
            if (j === 0 && i === 2) {
                to_print = true;
            } else if (j === 1 && (i === 0 || i === 2)) {
                to_print = true;
            } else if (j === 2 && i === 5) {
                to_print = true;
            } else if (j === 3 && i === 1) {
                to_print = true;
            } else if (j === 4 && i === 2) {
                to_print = true;
            } else if (j === 5 && i === 4) {
                to_print = true;
            }
        } else if (this.state % 2 === 1 && this.state < 4) {
            if (j === 0 && i === 3) {
                to_print = true;
            } else if (j === 1 && i === 1) {
                to_print = true;
            } else if (j === 2 && i === 5) {
                to_print = true;
            } else if (j === 3 && i === 0) {
                to_print = true;
            } else if (j === 4 && i === 1) {
                to_print = true;
            } else if (j === 4 && i === 4) {
                to_print = true;
            }
        } else if (this.state === 4) {
            if (j === 3 && i === 2) {
                to_print = true;
            } else if (j === 4 && i === 0) {
                to_print = true;
            } else if (j === 5 && i === 5) {
                to_print = true;
            }
        }
        if (to_print) {
            div.className = 'cell crashed_block';
        } else {
            div.className = 'cell empty_cell';
        }
    }

    draw_crashed_block(div, i, j) {
        // animation of crashing blocks
        if (this.state === 0) {
            if (j === 0 && (i >= 2 && i <= 4)) {
                div.className = 'cell crashing_block';
            } else {
                block.draw_Crashed_block(div, i, j);
            }
        } else if (this.state === 1) {
            if (j === 0 && (i >= 2 && i <= 3)) {
                div.className = 'cell crashing_block';
            } else if (j === 1 && (i >= 2 && i <= 4)) {
                div.className = 'cell crashing_block';
            } else if (j >= 1) {
                block.draw_Crashed_block(div, i, j);
            } else {
                div.className = 'cell empty_cell';
            }
        } else if (this.state === 2) {
            if (j === 0 && i === 3) {
                div.className = 'cell crashing_block';
            } else if (j === 1 && (i >= 2 && i <= 3)) {
                div.className = 'cell crashing_block';
            } else if (j === 2 && (i >= 2 && i <= 4)) {
                div.className = 'cell crashing_block';
            } else if (j >= 2) {
                block.draw_Crashed_block(div, i, j);
            } else {
                div.className = 'cell empty_cell';
            }
        } else if (this.state === 3) {
            if (j === 1 && i === 3) {
                div.className = 'cell crashing_block';
            } else if (j === 2 && (i >= 1 && i <= 3)) {
                div.className = 'cell crashing_block';
            } else if (j === 3 && (i >= 1 && i <= 5)) {
                div.className = 'cell crashing_block';
            } else if (j >= 3) {
                block.draw_Crashed_block(div, i, j);
            } else {
                div.className = 'cell empty_cell';
            }
        } else if (this.state === 4) {
            if (j === 2 && i === 3) {
                div.className = 'cell crashing_block';
            } else if (j === 3 && (i >= 2 && i <= 4)) {
                div.className = 'cell crashing_block';
            } else if (j === 4 && (i >= 1 && i <= 5)) {
                div.className = 'cell crashing_block';
            } else if (j >= 4) {
                block.draw_Crashed_block(div, i, j);
            } else {
                div.className = 'cell empty_cell';
            }
        } else if (this.state === 5) {
            if (j === 3 && i === 3) {
                div.className = 'cell crashing_block';
            } else if (j === 4 && (i >= 3 && i <= 5)) {
                div.className = 'cell crashing_block';
            } else if (j === 5 && (i >= 1 && i <= 5)) {
                div.className = 'cell crashing_block';
            } else {
                div.className = 'cell empty_cell';
            }
        }
    }

    delete(doc) {
        // full delete of block from document
        for (let i = 0; i < this.number_of_pixels; ++i) {
            for (let j = 0; j < this.number_of_pixels; ++j) {
                if (this.pixels[i][j] !== null && this.pixels[i][j] !== undefined) {
                    doc.body.removeChild(this.pixels[i][j]);
                    this.pixels[i][j] = null;
                }
            }
        }
    }
}
