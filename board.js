
class ScrabbleBoard {
    // Score value for each letter
    static get letterScores() { return {
        0: '?',
        1: 'a,e,i,l,n,o,r,s,t,u',
        2: 'd,g',
        3: 'b,c,m,p',
        4: 'f,h,v,w,y',
        5: 'k',
        8: 'j,x',
        10: 'q,z'
    };}

    // Position of the special tiles (center/triple-word/double-word/triple-letter/double-letter) - For a 11x11 Board
    static get specialTilePositionIndex() { return {
        'ct': [60],
        'tw': [2, 8, 22, 32, 88, 98, 112, 118],
        'dw': [12, 16, 20, 56, 64, 100, 104, 108],
        'tl': [0, 10, 24, 30, 36, 40, 80, 84, 90, 96, 110, 120],
        'dl': [26, 28, 46, 52, 68, 74, 92, 94]
    };}

    // Our default size is 11x11 board
    static get boardSize() { return 11;}

    constructor() {
        this.boardElement = document.getElementById('js-board');
    }

    // Append scrabble board element
    drawScrabbleBoard() {
        const oScrabbleBoard = this;
        const iBoardSize = ScrabbleBoard.boardSize;

        let oBoardElement = $('<div>').addClass('board');
        for (let iHorizontalCpt = 0; iHorizontalCpt < iBoardSize; iHorizontalCpt++) {
            let oRowElement = $('<div>').addClass('row');
            for (let iVerticalCpt = 0; iVerticalCpt < iBoardSize; iVerticalCpt++) {
                oRowElement.append(oScrabbleBoard.getTileElement(iHorizontalCpt, iVerticalCpt));
            }
            oBoardElement.append(oRowElement);
        }

        $(oScrabbleBoard.boardElement).append(oBoardElement);
        $(oScrabbleBoard.boardElement).on('keydown', '.tile input', function (event) {
            const oInputElement = $(this);
            const sKeyLetter = event.key;
            const iKeyCode = event.keyCode;

            if (iKeyCode >= 65 && iKeyCode <= 90) {
                oInputElement.val(sKeyLetter);
                oInputElement.addClass('filled');
                oInputElement.parent('.tile').attr('data-value', oScrabbleBoard.getScoreByLetter(sKeyLetter));
            } else if (iKeyCode === 8 || iKeyCode === 46) {
                oInputElement.removeClass('filled');
                oInputElement.parent('.tile').removeAttr('data-value');
            }
            return true;
        });
    }

    /**
     * Build the tile html element from row and column id
     * @param {int} iHorizontalId
     * @param {int} iVerticalId
     * @returns {jQuery}
     */
    getTileElement(iHorizontalId, iVerticalId){
        let oTileElement = $('<div>').addClass('tile').attr({'data-row': iHorizontalId, 'data-col': iVerticalId})
            .append($('<div>').addClass('decal'))
            .append($('<input>').attr({maxlength: 1, readonly: 1}));
        const iBoardIndex = iHorizontalId * ScrabbleBoard.boardSize + iVerticalId;
        for (let sSpecialTileType in ScrabbleBoard.specialTilePositionIndex) {
            if (ScrabbleBoard.specialTilePositionIndex[sSpecialTileType].indexOf(iBoardIndex) >= 0) {
                oTileElement.addClass('tile-' + sSpecialTileType);
                if (sSpecialTileType !== 'ct') {
                    oTileElement.children('.decal').text(sSpecialTileType.toUpperCase());
                }
            }
        }
        return oTileElement;
    }

    /**
     * Search the score value of the given letter
     * @param {string} sLetter
     * @returns {number}
     */
    getScoreByLetter(sLetter) {
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
}

document.addEventListener('DOMContentLoaded', function () {
    let scrabbleBoard = new ScrabbleBoard();
    scrabbleBoard.drawScrabbleBoard();
});
