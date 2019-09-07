import {mob} from './mob'
import {block} from './block'

export function initialize_empty_array(number_of_pixels) {
    // initialize empty array for pixels
    let arr = new Array(number_of_pixels);
    for (let index = 0; index < number_of_pixels; ++index) {
        arr[index] = new Array(number_of_pixels);
        for (let y = 0; y < number_of_pixels; ++y) {
            arr[index][y] = null;
        }
    }
    return arr;
}

export function processing_lvl(text) {
    // get new level, array of array, from string
    let level = new Array(text.length);
    let enemies = [];
    let main_hero = null;
    let number_of_cake = 0;
    for (let i = 0; i < text.length; ++i) {
        level[i] = new Array(text[i].length);
        for (let j = 0; j < text[i].length; ++j) {
            level[i][j] = new block(text[i][j], i, j, text.length);
            if (text[i][j] === '^') {
                enemies.push(new mob(level, false, i, j));
            } else if (text[i][j] === 'H') {
                main_hero = new mob(level, true, i, j);
            } else if (text[i][j] === '*') {
                number_of_cake += 1;
            }
        }
    }
    return [level, enemies, main_hero, number_of_cake];
}

export function read_level_from_file(name_of_file) {
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
}