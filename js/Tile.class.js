
export class Tile{

    constructor(sLetter, iRowNumber, iColumnNumber, iLetterMultiplier = 1, iWordMultiplier = 1){
        this.letter = sLetter;
        this.wordMuliplier = iWordMultiplier;
        this.letterMultiplier = iLetterMultiplier;
        this.isCenter = false;
        this.isAnchor = false;
        this.rowNomber = iRowNumber;
        this.columnNumber = iColumnNumber;
        this.horizontalAvailableLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.verticalAvailableLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.across_sum = 0;
        this.down_sum = 0;
    }
}
