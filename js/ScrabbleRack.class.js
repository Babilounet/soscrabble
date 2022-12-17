import {ScrabbleTools} from "./ScrabbleTools.class.js";

export class ScrabbleRack {

    constructor(sRackElementId) {
        this.rackElement = document.getElementById(sRackElementId);
    }

    // Our default rack size is 7 letters
    static get rackSize() {
        return 7;
    }

    // Parse the html rack to build an exploitable array out of it
    static getRackAsArray() {
        let aRack = [];
        for (let oRackTileElement of document.querySelector('.scrabble-rack').children) {
            let sLetter = oRackTileElement.dataset.letter ? oRackTileElement.dataset.letter.toString().toUpperCase() : '';
            aRack.push(sLetter);
        }
        return aRack;
    }

    // Save to rack in the local storage for actualisation or future visit
    static saveRackInLocalStorage() {
        localStorage.setItem('rack', JSON.stringify(ScrabbleRack.getRackAsArray()));
    }

    /**
     * Identify used letter in the move and mark them with a color in the html rack
     * @param {array} aBestMove An array of arrays each representing a tile, each array have at least [0] letter, [1] row number, [2] column number
     */
    static drawRackBestMove(aBestMove) {
        ScrabbleRack.resetRackBestMove();
        let aRackElements = document.querySelector('.scrabble-rack').children;
        for (let aMove of aBestMove) {
            for (let oRackElement of aRackElements) {
                if (oRackElement.dataset.letter === ' ' && aMove.length === 4 && aMove[3]) {
                    let oRackInput = oRackElement.querySelector('input');
                    oRackInput.classList.add('best-move-joker');
                    oRackElement.classList.add('best-move-joker');
                } else if (oRackElement.dataset.letter === aMove[0] && !oRackElement.classList.contains('best-move')) {
                    let oRackInput = oRackElement.querySelector('input');
                    oRackInput.classList.add('best-move');
                    oRackElement.classList.add('best-move');
                    break;
                }
            }
        }
    }

    // Remove the best move tile identification
    static resetRackBestMove() {
        let aRackElements = document.querySelector('.scrabble-rack').children;
        for (let oRackElement of aRackElements) {
            let oRackInput = oRackElement.querySelector('input');
            oRackInput.classList.remove('best-move');
            oRackElement.classList.remove('best-move');
            oRackInput.classList.remove('best-move-joker');
            oRackElement.classList.remove('best-move-joker');
        }
    }

    // Retrieve the local stored rack and draw it
    loadFromLocalStorage() {
        const aStoredRack = JSON.parse(localStorage.getItem('rack'));
        this.drawScrabbleRack(aStoredRack);
    }

    // Append scrabble rack element
    drawScrabbleRack(aStoredRack = []) {
        const oScrabbleRack = this;
        const iRackSize = ScrabbleRack.rackSize;

        let oRackElement = document.createElement('div');
        oRackElement.classList.add('scrabble-rack');
        for (let iRackCpt = 0; iRackCpt < iRackSize; iRackCpt++) {
            if (typeof aStoredRack[iRackCpt] !== 'undefined') {
                oRackElement.appendChild(oScrabbleRack.getRackTileElement(iRackCpt, aStoredRack[iRackCpt]));
            } else {
                oRackElement.appendChild(oScrabbleRack.getRackTileElement(iRackCpt));
            }
        }
        oScrabbleRack.rackElement.appendChild(oRackElement);
    }

    /**
     * Build the tile html element rack id
     * @param {int} iRackId
     * @param {string} sStoredRackLetter
     * @returns {HTMLDivElement}
     */
    getRackTileElement(iRackId, sStoredRackLetter = '') {
        let oRackTileElement = document.createElement('div');
        oRackTileElement.classList.add('scrabble-tile');
        oRackTileElement.dataset.id = iRackId.toString();

        let oRackDecalElement = document.createElement('div');
        oRackDecalElement.classList.add('scrabble-decal');

        let oRackInputElement = document.createElement('input');
        oRackInputElement.id = 'rack-input' + iRackId.toString();
        oRackInputElement.readonly = 'readonly';

        oRackInputElement.addEventListener('beforeinput', function (oEvent) {
            const oSelectedInput = this;
            const iPreviousRackTileId = parseInt(oSelectedInput.parentElement.dataset.id) - 1;
            const iNextRackTileId = parseInt(oSelectedInput.parentElement.dataset.id) + 1;
            const sKeyLetter = oEvent.data ?? '';

            // Alphabet or space or interrogation mark
            if (sKeyLetter.match(/^[a-z ?]$/i) !== null) {
                oEvent.preventDefault();
                oSelectedInput.setAttribute('value', sKeyLetter.toUpperCase());
                oSelectedInput.value = sKeyLetter.toUpperCase();
                oSelectedInput.classList.add('scrabble-filled');
                oSelectedInput.parentElement.dataset.letter = sKeyLetter.toUpperCase();
                if (sKeyLetter.match(/^[a-z]$/i) !== null) {
                    oSelectedInput.parentElement.dataset.value = ScrabbleTools.getScoreByLetter(sKeyLetter).toString();
                }
                if (iNextRackTileId < ScrabbleRack.rackSize) {
                    document.getElementById('rack-input' + iNextRackTileId.toString()).focus();
                }
                // Delete & Back
            } else if (sKeyLetter === '' && oSelectedInput.value) {
                oEvent.preventDefault();
                const isFilled = oSelectedInput.classList.contains('scrabble-filled');
                oSelectedInput.removeAttribute('value');
                oSelectedInput.value = '';
                oSelectedInput.classList.remove('scrabble-filled');
                delete oSelectedInput.parentElement.dataset.value;
                delete oSelectedInput.parentElement.dataset.letter;
                if (iPreviousRackTileId >= 0) {
                    const oPreviousInputElement = document.getElementById('rack-input' + iPreviousRackTileId.toString());
                    if (!isFilled) {
                        oPreviousInputElement.removeAttribute('value');
                        oPreviousInputElement.value = '';
                        oPreviousInputElement.classList.remove('scrabble-filled');
                        delete oPreviousInputElement.parentElement.dataset.value;
                    }
                    oPreviousInputElement.focus();
                }
            }
        });
        oInputElement.addEventListener('input', function () {
            const oSelectedInput = this;
            if (oSelectedInput.value.length > 1) {
                oSelectedInput.value = oSelectedInput.parent.dataset.letter;
            }
        });
        oRackInputElement.addEventListener('keydown', function (oEvent) {
            const oSelectedInput = this;
            const iPreviousRackTileId = parseInt(oSelectedInput.parentElement.dataset.id) - 1;

            if (event.key === 'Backspace' || event.key === 'Delete') {
                oEvent.preventDefault();
                const isFilled = oSelectedInput.classList.contains('scrabble-filled');
                oSelectedInput.removeAttribute('value');
                oSelectedInput.value = '';
                oSelectedInput.classList.remove('scrabble-filled');
                delete oSelectedInput.parentElement.dataset.value;
                delete oSelectedInput.parentElement.dataset.letter;
                if (iPreviousRackTileId >= 0) {
                    const oPreviousInputElement = document.getElementById('rack-input' + iPreviousRackTileId.toString());
                    if (!isFilled) {
                        oPreviousInputElement.removeAttribute('value');
                        oPreviousInputElement.value = '';
                        oPreviousInputElement.classList.remove('scrabble-filled');
                        delete oPreviousInputElement.parentElement.dataset.value;
                    }
                    oPreviousInputElement.focus();
                }
            }
        });

        if (sStoredRackLetter) {
            oRackInputElement.setAttribute('value', sStoredRackLetter);
            oRackInputElement.value = sStoredRackLetter;
            oRackInputElement.classList.add('scrabble-filled');
            oRackTileElement.dataset.value = ScrabbleTools.getScoreByLetter(sStoredRackLetter).toString();
            oRackTileElement.dataset.letter = sStoredRackLetter;
        }

        oRackTileElement.appendChild(oRackDecalElement);
        oRackTileElement.appendChild(oRackInputElement);

        return oRackTileElement;
    }
}
