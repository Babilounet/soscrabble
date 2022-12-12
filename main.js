import {ScrabbleBoard} from "./js/ScrabbleBoard.class.js";
import {ScrabbleRack} from "./js/ScrabbleRack.class.js";
import {Solver} from "./js/Solver.class.js";
import {ScrabbleTools} from "./js/ScrabbleTools.class.js";

document.addEventListener('DOMContentLoaded', function () {
    let oScrabbleBoard = new ScrabbleBoard('scrabble-board');
    if (localStorage.getItem('board')) {
        oScrabbleBoard.loadFromLocalStorage();
    } else {
        oScrabbleBoard.drawScrabbleBoard();
    }

    let oScrabbleRack = new ScrabbleRack('scrabble-rack');
    if (localStorage.getItem('rack')) {
        oScrabbleRack.loadFromLocalStorage();
    } else {
        oScrabbleRack.drawScrabbleRack();
    }

    let oSolver = new Solver('dictionaries/dictionary-fr.txt');

    document.querySelector('#save-board').addEventListener('click', ScrabbleTools.saveDataInLocalStorage);
    document.querySelector('#find-best-move').addEventListener('click', function () {
        oSolver.findBestMove();
    });
});
