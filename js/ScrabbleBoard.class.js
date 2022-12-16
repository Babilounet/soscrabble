import {ScrabbleTools} from "./ScrabbleTools.class.js";
import {Tile} from "./Tile.class.js";

export class ScrabbleBoard {

    constructor(sBoardElementId) {
        this.boardElement = document.getElementById(sBoardElementId);
    }

    // Position of the special tiles (center/triple-word/double-word/triple-letter/double-letter) - For a 11x11 Board
    static get specialTilePositionIndex() {
        return {
            'ct': [60],
            'mt': [2, 8, 22, 32, 88, 98, 112, 118],
            'md': [12, 16, 20, 56, 64, 100, 104, 108],
            'lt': [0, 10, 24, 30, 36, 40, 80, 84, 90, 96, 110, 120],
            'ld': [26, 28, 46, 52, 68, 74, 92, 94]
        };
    }

    // Our default size is 11x11 board
    static get boardSize() {
        return 11;
    }

    // Parse the html board to build an exploitable array out of it
    static getBoardAsArray() {
        let aBoard = [];
        for (let oRowElement of document.querySelector('.scrabble-board').children) {
            let aRow = [];
            for (let oTileElement of oRowElement.children) {
                let sLetter = oTileElement.dataset.letter ? oTileElement.dataset.letter.toString().toUpperCase() : '';
                let iRowNumber = parseInt(oTileElement.dataset.row);
                let iColumnNumber = parseInt(oTileElement.dataset.column);
                let iLetterMultiplier = parseInt(oTileElement.dataset.lettermultiplier);
                let iWordMultiplier = parseInt(oTileElement.dataset.wordmultiplier);
                aRow.push(new Tile(sLetter, iRowNumber, iColumnNumber, iLetterMultiplier, iWordMultiplier));
            }
            aBoard.push(aRow);
        }
        return aBoard;
    }

    // Save to board in the local storage for actualisation or future visit
    static saveBoardInLocalStorage() {
        localStorage.setItem('board', JSON.stringify(ScrabbleBoard.getBoardAsArray()));
        document.querySelector('.save-check').classList.remove('invisible');
    }

    /**
     * Draw the given move on the board
     * @param {array} aBestMove An array of arrays each representing a tile, each array have at least [0] letter, [1] row number, [2] column number
     */
    static drawBoardBestMove(aBestMove) {
        ScrabbleBoard.resetBoardMoves();
        for (let aMove of aBestMove) {
            let oTileElement = document.querySelector('.scrabble-board').children[aMove[1]].children[aMove[2]];
            if (typeof oTileElement.dataset.letter === 'undefined') {
                let oSelectedInput = oTileElement.querySelector('input');
                oSelectedInput.setAttribute('value', aMove[0]);
                oSelectedInput.classList.add('scrabble-filled');
                (aMove.length === 4 && aMove[3]) ? oSelectedInput.classList.add('best-move-joker') : oSelectedInput.classList.add('best-move');
                oTileElement.dataset.value = ScrabbleTools.getScoreByLetter(aMove[0]).toString();
                oTileElement.dataset.letter = aMove[0];
            }
        }
    }

    // Remove the best move tile identification
    static resetBoardMoves() {
        const aTiles = document.querySelectorAll('.scrabble-tile')
        for (let oTileElement of aTiles) {
            let oSelectedInput = oTileElement.querySelector('input');
            oTileElement.classList.remove('best-move');
            oTileElement.classList.remove('best-move-joker');
            oTileElement.classList.remove('word-error');
            oSelectedInput.classList.remove('best-move');
            oSelectedInput.classList.remove('best-move-joker');
            oSelectedInput.classList.remove('word-error');
        }
    }

    /**
     * Reset all the available letters and anchors for the given board
     * @param {array} aBoard
     * @returns {array}
     */
    static resetAnchorsAndAvailableLetter(aBoard) {
        let aResetBoard = [];
        for (let aRow of aBoard) {
            let aResetRow = [];
            for (let oTile of aRow) {
                oTile.isAnchor = false;
                oTile.horizontalAvailableLetters = ScrabbleTools.getAlphabet();
                oTile.verticalAvailableLetters = ScrabbleTools.getAlphabet();
                aResetRow.push(oTile);
            }
            aResetBoard.push(aResetRow);
        }
        return aResetBoard;
    }

    /**
     * Search the word in board and set it as error
     * @param {string} sWord
     * @param {array} aBoard
     */
    static setWordAsError(sWord, aBoard) {
        for (let iValidationRowNumber = 0; iValidationRowNumber < ScrabbleBoard.boardSize; iValidationRowNumber++) {
            let sSearchWord = '';
            for (let iValidationColumnNumber = 0; iValidationColumnNumber < ScrabbleBoard.boardSize; iValidationColumnNumber++) {
                if (aBoard[iValidationRowNumber][iValidationColumnNumber].letter !== '') {
                    sSearchWord += aBoard[iValidationRowNumber][iValidationColumnNumber].letter;
                } else {
                    sSearchWord = '';
                }
                if (sSearchWord === sWord) {
                    while (iValidationColumnNumber >= 0 && aBoard[iValidationRowNumber][iValidationColumnNumber].letter !== '') {
                        document.querySelector('.scrabble-board').children[iValidationRowNumber].children[iValidationColumnNumber].classList.add('word-error');
                        document.querySelector('.scrabble-board').children[iValidationRowNumber].children[iValidationColumnNumber].querySelector('input').classList.add('word-error');
                        iValidationColumnNumber--;
                    }
                    return;
                }
            }
        }
        for (let iValidationColumnNumber = 0; iValidationColumnNumber < ScrabbleBoard.boardSize; iValidationColumnNumber++) {
            let sSearchWord = '';
            for (let iValidationRowNumber = 0; iValidationRowNumber < ScrabbleBoard.boardSize; iValidationRowNumber++) {
                if (aBoard[iValidationRowNumber][iValidationColumnNumber].letter !== '') {
                    sSearchWord += aBoard[iValidationRowNumber][iValidationColumnNumber].letter;
                } else {
                    sSearchWord = '';
                }
                if (sSearchWord === sWord) {
                    while (iValidationRowNumber >= 0 && aBoard[iValidationRowNumber][iValidationColumnNumber].letter !== '') {
                        document.querySelector('.scrabble-board').children[iValidationRowNumber].children[iValidationColumnNumber].classList.add('word-error');
                        document.querySelector('.scrabble-board').children[iValidationRowNumber].children[iValidationColumnNumber].querySelector('input').classList.add('word-error');
                        iValidationRowNumber--;
                    }
                    return;
                }
            }
        }
    }

    // Retrieve the local stored board and draw it
    loadFromLocalStorage() {
        const aStoredBoard = JSON.parse(localStorage.getItem('board'));
        this.drawScrabbleBoard(aStoredBoard);
    }

    // Append scrabble board element
    drawScrabbleBoard(aStoredBoard = []) {
        const oScrabbleBoard = this;
        const iBoardSize = ScrabbleBoard.boardSize;

        let oBoardElement = document.createElement('div');
        oBoardElement.classList.add('scrabble-board');
        for (let iHorizontalCpt = 0; iHorizontalCpt < iBoardSize; iHorizontalCpt++) {
            let oRowElement = document.createElement('div');
            oRowElement.classList.add('scrabble-row');
            for (let iVerticalCpt = 0; iVerticalCpt < iBoardSize; iVerticalCpt++) {
                if (typeof aStoredBoard[iHorizontalCpt] !== 'undefined' && typeof aStoredBoard[iHorizontalCpt][iVerticalCpt] !== 'undefined') {
                    oRowElement.appendChild(oScrabbleBoard.getTileElement(iHorizontalCpt, iVerticalCpt, aStoredBoard[iHorizontalCpt][iVerticalCpt]));
                } else {
                    oRowElement.appendChild(oScrabbleBoard.getTileElement(iHorizontalCpt, iVerticalCpt));
                }
            }
            oBoardElement.appendChild(oRowElement);
        }
        oScrabbleBoard.boardElement.appendChild(oBoardElement);
    }

    /**
     * Build the tile html element from row and column id
     * @param {int} iHorizontalId
     * @param {int} iVerticalId
     * @param {array} aStoredTile
     * @returns {HTMLDivElement}
     */
    getTileElement(iHorizontalId, iVerticalId, aStoredTile = []) {
        let oTileElement = document.createElement('div');
        oTileElement.classList.add('scrabble-tile');
        oTileElement.dataset.row = iHorizontalId.toString();
        oTileElement.dataset.column = iVerticalId.toString();
        oTileElement.dataset.lettermultiplier = '1';
        oTileElement.dataset.wordmultiplier = '1';

        let oDecalElement = document.createElement('div');
        oDecalElement.classList.add('scrabble-decal');

        let oInputElement = document.createElement('input');
        oInputElement.readonly = 'readonly';

        oInputElement.addEventListener('beforeinput', function (oEvent) {
            console.log('input event');
            const oSelectedInput = this;
            const sKeyLetter = oEvent.data ?? '';

            console.log('oEvent.data');
            console.log(oEvent.data);
            // Alphabet
            if (sKeyLetter.match(/^[a-z]$/i) !== null) {
                console.log('Match');
                oSelectedInput.setAttribute('value', sKeyLetter);
                oSelectedInput.value = sKeyLetter;
                oSelectedInput.classList.add('scrabble-filled');
                oSelectedInput.parentElement.dataset.value = ScrabbleTools.getScoreByLetter(sKeyLetter).toString();
                oSelectedInput.parentElement.dataset.letter = sKeyLetter;
                // Delete & Back
            } else if (sKeyLetter === '' && oSelectedInput.value) {
                console.log('Empty');
                oEvent.preventDefault();
                console.log('Empty removeAttribute');
                oSelectedInput.removeAttribute('value');
                oSelectedInput.value = '';
                console.log('Empty classList.remove');
                oSelectedInput.classList.remove('scrabble-filled');
                delete oSelectedInput.parentElement.dataset.value;
                delete oSelectedInput.parentElement.dataset.letter;
            }

            return true;
        });
        oInputElement.addEventListener('keydown', function (oEvent) {
            console.log('keydown event');
            const oSelectedInput = this;

            console.log('event.key');
            console.log(event.key);
            if (event.key === 'Backspace' || event.key === 'Delete') {
                console.log('Backspace Delete');
                oEvent.preventDefault();
                console.log('Backspace removeAttribute');
                oSelectedInput.removeAttribute('value');
                oSelectedInput.value = '';
                console.log('Backspace classList.remove');
                oSelectedInput.classList.remove('scrabble-filled');
                delete oSelectedInput.parentElement.dataset.value;
                delete oSelectedInput.parentElement.dataset.letter;
            }
        });

        const iBoardIndex = iHorizontalId * ScrabbleBoard.boardSize + iVerticalId;
        for (let sSpecialTileType in ScrabbleBoard.specialTilePositionIndex) {
            if (ScrabbleBoard.specialTilePositionIndex[sSpecialTileType].indexOf(iBoardIndex) >= 0) {
                oTileElement.classList.add('scrabble-tile-' + sSpecialTileType);
                if (sSpecialTileType !== 'ct') {
                    oDecalElement.innerHTML = sSpecialTileType.toUpperCase();
                }
                switch (sSpecialTileType) {
                    case 'mt' :
                        oTileElement.dataset.wordmultiplier = '3';
                        break;
                    case 'md':
                        oTileElement.dataset.wordmultiplier = '2';
                        break;
                    case 'lt':
                        oTileElement.dataset.lettermultiplier = '3';
                        break;
                    case 'ld':
                        oTileElement.dataset.lettermultiplier = '2';
                        break;
                }
            }
        }

        const sStoredLetter = (aStoredTile && typeof aStoredTile['letter'] !== 'undefined') ? aStoredTile['letter'] : '';
        if (sStoredLetter) {
            oInputElement.setAttribute('value', sStoredLetter);
            oInputElement.classList.add('scrabble-filled');
            oTileElement.dataset.value = ScrabbleTools.getScoreByLetter(sStoredLetter).toString();
            oTileElement.dataset.letter = sStoredLetter;
        }

        oTileElement.appendChild(oDecalElement);
        oTileElement.appendChild(oInputElement);

        return oTileElement;
    }

}
