import {ScrabbleBoard} from "./js/ScrabbleBoard.class.js";
import {ScrabbleRack} from "./js/ScrabbleRack.class.js";
import {Solver} from "./js/Solver.class.js";
import {ScrabbleTools} from "./js/ScrabbleTools.class.js";

document.addEventListener('DOMContentLoaded', function () {
    let oScrabbleBoard = new ScrabbleBoard('scrabble-board');
    localStorage.getItem('board') ? oScrabbleBoard.loadFromLocalStorage() : oScrabbleBoard.drawScrabbleBoard();

    let oScrabbleRack = new ScrabbleRack('scrabble-rack');
    localStorage.getItem('rack') ? oScrabbleRack.loadFromLocalStorage() : oScrabbleRack.drawScrabbleRack();

    let oSolver = new Solver('dictionaries/dictionary-fr.txt');

    document.querySelector('#save-board').addEventListener('click', ScrabbleTools.saveDataInLocalStorage);
    document.querySelector('#find-best-move').addEventListener('click', function () {
        document.querySelector('.find-minifying-glass').classList.add('vjs-hidden');
        document.querySelector('.find-spinner').classList.remove('vjs-hidden');
        setTimeout(function () {
            oSolver.findBestMove();
            document.querySelector('.find-spinner').classList.add('vjs-hidden');
            document.querySelector('.find-minifying-glass').classList.remove('vjs-hidden');
        }, 100);

    });
});
