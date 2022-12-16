import {ScrabbleBoard} from "./js/ScrabbleBoard.class.js";
import {ScrabbleRack} from "./js/ScrabbleRack.class.js";
import {Solver} from "./js/Solver.class.js";
import {ScrabbleTools} from "./js/ScrabbleTools.class.js";

document.addEventListener('DOMContentLoaded', function () {
    (function () {
        var old = console.log;
        var logger = document.getElementById('log');
        console.log = function (message) {
            if (typeof message == 'object') {
                logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
            } else {
                logger.innerHTML += message + '<br />';
            }
        }
    })();
    
    let oScrabbleBoard = new ScrabbleBoard('scrabble-board');
    localStorage.getItem('board') ? oScrabbleBoard.loadFromLocalStorage() : oScrabbleBoard.drawScrabbleBoard();

    let oScrabbleRack = new ScrabbleRack('scrabble-rack');
    localStorage.getItem('rack') ? oScrabbleRack.loadFromLocalStorage() : oScrabbleRack.drawScrabbleRack();

    let oSolver = new Solver('dictionaries/dictionary-fr.txt');

    document.querySelector('#save-board').addEventListener('click', ScrabbleTools.saveDataInLocalStorage);
    document.querySelector('#find-best-move').addEventListener('click', function () {
        document.querySelector('.find-spinner').classList.remove('invisible');
        setTimeout(function () {
            oSolver.findBestMove();
            document.querySelector('.find-spinner').classList.add('invisible');
        }, 100);

    });
});
