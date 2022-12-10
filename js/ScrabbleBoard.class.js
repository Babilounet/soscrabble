export class ScrabbleBoard {

    constructor(sBoardElementId) {
        this.boardElement = document.getElementById(sBoardElementId);
    }

    // Score value for each letter
    static get letterScores() {
        return {
            0: '?',
            1: 'a,e,i,l,n,o,r,s,t,u',
            2: 'd,g',
            3: 'b,c,m,p',
            4: 'f,h,v,w,y',
            5: 'k',
            8: 'j,x',
            10: 'q,z'
        };
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

    /**
     * Search the score value of the given letter
     * @param {string} sLetter
     * @returns {number}
     */
    static getScoreByLetter(sLetter) {
        const aScores = ScrabbleBoard.letterScores;
        if (sLetter.length !== 1) {
            return 0;
        }
        for (let iScore in aScores) {
            if (aScores[iScore].indexOf(sLetter.toLowerCase()) >= 0) {
                return iScore;
            }
        }
        return 0;
    }

    // Append scrabble board element
    drawScrabbleBoard() {
        const oScrabbleBoard = this;
        const iBoardSize = ScrabbleBoard.boardSize;

        let oBoardElement = document.createElement('div');
        oBoardElement.classList.add('board');
        for (let iHorizontalCpt = 0; iHorizontalCpt < iBoardSize; iHorizontalCpt++) {
            let oRowElement = document.createElement('div');
            oRowElement.classList.add('row');
            for (let iVerticalCpt = 0; iVerticalCpt < iBoardSize; iVerticalCpt++) {
                oRowElement.appendChild(oScrabbleBoard.getTileElement(iHorizontalCpt, iVerticalCpt));
            }
            oBoardElement.appendChild(oRowElement);
        }
        oScrabbleBoard.boardElement.appendChild(oBoardElement);
    }

    /**
     * Build the tile html element from row and column id
     * @param {int} iHorizontalId
     * @param {int} iVerticalId
     * @returns {HTMLDivElement}
     */
    getTileElement(iHorizontalId, iVerticalId) {
        let oTileElement = document.createElement('div');
        oTileElement.classList.add('tile');
        oTileElement.dataset.row = iHorizontalId.toString();
        oTileElement.dataset.column = iVerticalId.toString();

        let oDecalElement = document.createElement('div');
        oDecalElement.classList.add('decal');

        let oInputElement = document.createElement('input');
        oInputElement.maxLength = 1;
        oInputElement.readonly = 'readonly';

        oInputElement.addEventListener('keydown', function (oEvent) {
            const oSelectedInput = this;
            const sKeyLetter = oEvent.key;
            const iKeyCode = oEvent.keyCode;

            // Alphabet
            if (iKeyCode >= 65 && iKeyCode <= 90) {
                oSelectedInput.setAttribute('value', sKeyLetter);
                oSelectedInput.classList.add('filled');
                oSelectedInput.parentElement.dataset.value = ScrabbleBoard.getScoreByLetter(sKeyLetter).toString();
                // Delete & Back
            } else if (iKeyCode === 8 || iKeyCode === 46) {
                oSelectedInput.classList.remove('filled');
                delete oSelectedInput.parentElement.dataset.value;
            }

            return true;
        });

        const iBoardIndex = iHorizontalId * ScrabbleBoard.boardSize + iVerticalId;
        for (let sSpecialTileType in ScrabbleBoard.specialTilePositionIndex) {
            if (ScrabbleBoard.specialTilePositionIndex[sSpecialTileType].indexOf(iBoardIndex) >= 0) {
                oTileElement.classList.add('tile-' + sSpecialTileType);
                if (sSpecialTileType !== 'ct') {
                    oDecalElement.innerHTML = sSpecialTileType.toUpperCase();
                }
            }
        }

        oTileElement.appendChild(oDecalElement);
        oTileElement.appendChild(oInputElement);

        return oTileElement;
    }
}
