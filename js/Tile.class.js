export class Tile {

    constructor(sLetter, iRowNumber, iColumnNumber, iLetterMultiplier = 1, iWordMultiplier = 1) {
        this.letter = sLetter;
        this.wordMuliplier = iWordMultiplier;
        this.letterMultiplier = iLetterMultiplier;
        this.isAnchor = false;
        this.rowNumber = iRowNumber;
        this.columnNumber = iColumnNumber;
        this.horizontalAvailableLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.verticalAvailableLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.horizontalSum = 0;
        this.verticalSum = 0;
    }
}
