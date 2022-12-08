
class ScrabbleBoard {

    constructor() {
        this.board = document.getElementById("js-board");
        this.boardSize = 11;
    }

    draw() {
        console.log(this.boardSize);
        const sb = this;
        const tileScoreIdx = {
            'ct': [60],
            'tw': [2, 8, 22, 32, 88, 98, 112, 118],
            'dw': [12, 16, 20, 56, 64, 100, 104, 108],
            'tl': [0, 10, 24, 30, 36, 40, 80, 84, 90, 96, 110, 120],
            'dl': [26, 28, 46, 52, 68, 74, 92, 94]
        };
        let board = $('<div>').addClass('board');
        // define a quarter of the board and use for x and y axis mirroring
        for (let i = 0; i < this.boardSize; i++) {
            let row = $('<div>').addClass('row');
            for (let j = 0; j < this.boardSize; j++) {
                let tile = $('<div>').addClass('tile')
                    .attr({'data-row': i, 'data-col': j})
                    .append($('<div>').addClass('decal'))
                    .append($('<input>').attr({maxlength: 1, readonly: 1}));
                const ti = this.toTileIndex(i, j, this.boardSize);
                for (let t in tileScoreIdx) {
                    const idx = tileScoreIdx[t].indexOf(ti);
                    if (idx >= 0) {
                        tile.addClass('tile-' + t);
                        if (i !== this.boardSize / 2 || j !== this.boardSize / 2) {
                            tile.children('.decal').text(t.toUpperCase());
                        }
                    }
                }
                row.append(tile);
            }
            board.append(row);
        }
        $(this.board).append(board);
        // listener for tile keydown event
        $(this.board).on('keydown', '.tile input', function (event) {
            const elem = $(this);
            const ltr = event.key;
            const keyCode = event.keyCode;
            // only update on alphabet char
            if (keyCode >= 65 && keyCode <= 90) {
                elem.val(ltr);
                elem.addClass('filled');
                elem.parent(".tile").attr("data-value", sb.letterValue(ltr));
            }
            // clear on backspace or delete
            else if (keyCode === 8 || keyCode === 46) {
                elem.removeClass('filled');
                elem.parent(".tile").removeAttr("data-value");
            }
            // allow change
            return true;
        });
    }

    /**
     * Converts row and column to single index.
     * @param {int} row
     * @param {int} column
     * @param {int} boardSize
     * @returns {int} -1 if row or column is out of range
     */
    toTileIndex(row, column, boardSize) {
        if (row < boardSize && row >= 0 && column < boardSize && column >= 0) {
            return row * boardSize + column;
        } else {
            return -1;
        }
    };

    /**
     * Get the letter score value
     */
    letterValue(letter) {
        const tileScore = {
            0: '?', 1: 'a,e,i,l,n,o,r,s,t,u', 2: 'd,g', 3: 'b,c,m,p', 4: 'f,h,v,w,y', 5: 'k', 8: 'j,x', 10: 'q,z'
        };
        if (letter.length === 1) {
            for (let v in tileScore) {
                if (tileScore[v].indexOf(letter.toLowerCase()) >= 0) {
                    return v;
                }
            }
        }
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let board = new ScrabbleBoard();
    console.log(board);
    board.draw();
});
