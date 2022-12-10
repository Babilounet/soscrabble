import {ScrabbleBoard} from "./js/ScrabbleBoard.class.js";

document.addEventListener('DOMContentLoaded', function () {
    let scrabbleBoard = new ScrabbleBoard('scrabble-board');
    scrabbleBoard.drawScrabbleBoard();
});
