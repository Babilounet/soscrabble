import {ScrabbleTools} from "./ScrabbleTools.class.js";

export class ScrabbleRack {

    constructor(sRackElementId) {
        this.rackElement = document.getElementById(sRackElementId);
    }

    // Our default rack size is 7 letters
    static get rackSize() {
        return 7;
    }

    static getRackAsArray() {
        let aRack = [];
        for (let oRackTileElement of document.querySelector('.scrabble-rack').children) {
            let sLetter = oRackTileElement.dataset.letter ? oRackTileElement.dataset.letter.toString().toUpperCase() : '';
            aRack.push(sLetter);
        }
        return aRack;
    }

    static saveRackInLocalStorage(oEvent) {
        localStorage.setItem('rack', JSON.stringify(ScrabbleRack.getRackAsArray()));
    }

    static drawRackBestMove(aBestMove) {
        let aRackElements = document.querySelector('.scrabble-rack').children;
        for (let aMove of aBestMove) {
            for (let oRackElement of aRackElements) {
                if (oRackElement.dataset.letter === aMove[0] && !oRackElement.classList.contains('best-move')) {
                    let oRackInput = oRackElement.querySelector('input');
                    oRackInput.classList.add('best-move');
                    oRackElement.classList.add('best-move');
                    break;
                }
            }
        }
    }

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
        oRackInputElement.maxLength = 1;
        oRackInputElement.readonly = 'readonly';

        oRackInputElement.addEventListener('keydown', function (oEvent) {
            oEvent.preventDefault();
            const oSelectedInput = this;
            const iPreviousRackTileId = parseInt(oSelectedInput.parentElement.dataset.id) - 1;
            const iNextRackTileId = parseInt(oSelectedInput.parentElement.dataset.id) + 1;
            const iKeyCode = oEvent.keyCode;
            const sKeyLetter = (iKeyCode === 32 || (oEvent.shiftKey && iKeyCode === 188)) ? ' ' : oEvent.key;

            // Alphabet or space or interrogation mark
            if ((iKeyCode >= 65 && iKeyCode <= 90) || iKeyCode === 32 || (oEvent.shiftKey && iKeyCode === 188)) {
                oSelectedInput.setAttribute('value', sKeyLetter);
                oSelectedInput.classList.add('scrabble-filled');
                oSelectedInput.parentElement.dataset.letter = sKeyLetter;
                if ((iKeyCode >= 65 && iKeyCode <= 90)) {
                    oSelectedInput.parentElement.dataset.value = ScrabbleTools.getScoreByLetter(sKeyLetter).toString();
                }
                if (iNextRackTileId < ScrabbleRack.rackSize) {
                    document.getElementById('rack-input' + iNextRackTileId.toString()).focus();
                }
                // Delete & Back
            } else if (iKeyCode === 8 || iKeyCode === 46) {
                const isFilled = !!oSelectedInput.value.length;
                oSelectedInput.removeAttribute('value');
                oSelectedInput.classList.remove('scrabble-filled');
                delete oSelectedInput.parentElement.dataset.value;
                delete oSelectedInput.parentElement.dataset.letter;
                if (iPreviousRackTileId >= 0) {
                    const oPreviousInputElement = document.getElementById('rack-input' + iPreviousRackTileId.toString());
                    if (!isFilled) {
                        oPreviousInputElement.removeAttribute('value');
                        oPreviousInputElement.classList.remove('scrabble-filled');
                        delete oPreviousInputElement.parentElement.dataset.value;
                    }
                    oPreviousInputElement.focus();
                }
            }
        });

        if (sStoredRackLetter) {
            oRackInputElement.setAttribute('value', sStoredRackLetter);
            oRackInputElement.classList.add('scrabble-filled');
            oRackTileElement.dataset.value = ScrabbleTools.getScoreByLetter(sStoredRackLetter).toString();
            oRackTileElement.dataset.letter = sStoredRackLetter;
        }

        oRackTileElement.appendChild(oRackDecalElement);
        oRackTileElement.appendChild(oRackInputElement);

        return oRackTileElement;
    }
}
