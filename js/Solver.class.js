import {TrieTree} from "./TrieTree.class.js";
import {ScrabbleTools} from "./ScrabbleTools.class.js";
import {ScrabbleRack} from "./ScrabbleRack.class.js";
import {ScrabbleBoard} from "./ScrabbleBoard.class.js";

export class Solver {

    constructor(sDictionaryFilePath) {
        this.board = [];
        this.rack = [];
        this.dictionary = new TrieTree(sDictionaryFilePath);
        this.bestMoves = [];
        this.bestMove = [];
        this.bestScore = 1;

    }

    findBestMove() {
        this.bestMoves = [];
        this.bestMove = [];
        this.bestScore = 1;
        this.board = ScrabbleBoard.resetAnchorsAndAvailableLetter(ScrabbleBoard.getBoardAsArray());
        this.rack = ScrabbleRack.getRackAsArray()
        for (let iCpt = 0; iCpt < ScrabbleBoard.boardSize; iCpt++) {
            this.checkHorizontalValuesByRowNumber(iCpt);
            this.checkVerticalValuesByColumnNumber(iCpt);
        }

        this.generateBestMoves();
        if (this.bestMove) {
            ScrabbleBoard.drawBoardBestMove(this.bestMove);
            ScrabbleRack.drawRackBestMove(this.bestMove);
            console.log(this);
            this.board = ScrabbleBoard.resetAnchorsAndAvailableLetter(ScrabbleBoard.getBoardAsArray());
            for (let iCpt = 0; iCpt < ScrabbleBoard.boardSize; iCpt++) {
                this.checkHorizontalValuesByRowNumber(iCpt);
                this.checkVerticalValuesByColumnNumber(iCpt);
            }
        }
    }

    calculateScoreForGivenTiles(aTiles) {
        let iScore = 0;
        for (let aTile of aTiles) {
            iScore += ScrabbleTools.getScoreByLetter(aTile.letter);
        }
        return iScore;
    }

    checkHorizontalValuesByRowNumber(iRowNumber) {
        for (let iColumnNumber in this.board[iRowNumber]) {
            let oTile = this.board[iRowNumber][iColumnNumber];
            this.board[iRowNumber][iColumnNumber].horizontalAvailableLetters = ScrabbleTools.getAlphabet();

            // Skip the tile already containing letters
            if (oTile.letter) {
                continue;
            }

            // Prefix is all the placed letters before our tile
            let iPrefixRowNumber = oTile.rowNumber;
            let iPrefixColumnNumber = oTile.columnNumber;
            let sPrefix = '';
            let aPrefixTiles = [];
            while (iPrefixColumnNumber > 0) {
                iPrefixColumnNumber -= 1;
                let oCurrentTile = this.board[iPrefixRowNumber][iPrefixColumnNumber];
                if (oCurrentTile.letter) {
                    sPrefix += oCurrentTile.letter.toUpperCase();
                    aPrefixTiles.push(oCurrentTile);
                } else {
                    break;
                }
            }

            // Reverse the string to have the prefix in the right order
            sPrefix = [...sPrefix].reverse().join('');

            // The suffix if all the placed letters after our tile
            let iSuffixRowNumber = oTile.rowNumber;
            let iSuffixColumnNumber = oTile.columnNumber;
            let sSuffix = '';
            let aSuffixTiles = [];
            while (iSuffixColumnNumber < ScrabbleBoard.boardSize - 1) {
                iSuffixColumnNumber += 1;
                let oCurrentTile = this.board[iSuffixRowNumber][iSuffixColumnNumber];
                if (oCurrentTile.letter) {
                    sSuffix += oCurrentTile.letter.toUpperCase();
                    aSuffixTiles.push(oCurrentTile);
                } else {
                    break;
                }
            }

            // No surrounding letters, go to next tile
            if (sPrefix === '' && sSuffix === '') {
                continue;
            }

            // At least one adjacent tile is filled, mark the tile as a possible anchor for a new word
            this.board[iRowNumber][iColumnNumber].isAnchor = true;

            // Update the across sum by adding the points for the suffix and prefix
            this.board[iRowNumber][iColumnNumber].horizontalSum = this.calculateScoreForGivenTiles(aPrefixTiles) + this.calculateScoreForGivenTiles(aSuffixTiles);

            // Update the possible available letters of this tile
            this.updateHorizontalAvailableLetters(sPrefix, oTile);
        }
    }

    checkVerticalValuesByColumnNumber(iColumnNumber) {
        for (let iRowNumber in this.board) {
            let oTile = this.board[iRowNumber][iColumnNumber];

            // Reset Available letters
            this.board[iRowNumber][iColumnNumber].verticalAvailableLetters = ScrabbleTools.getAlphabet();

            // If the letter is already placed then skip it
            if (oTile.letter) {
                continue;
            }

            // Prefix is all the placed letters before our tile
            let iPrefixRowNumber = oTile.rowNumber;
            let iPrefixColumnNumber = oTile.columnNumber;
            let sPrefix = '';
            let aPrefixTiles = [];
            while (iPrefixRowNumber > 0) {
                iPrefixRowNumber -= 1
                let oCurrentTile = this.board[iPrefixRowNumber][iPrefixColumnNumber];
                if (oCurrentTile.letter) {
                    sPrefix += oCurrentTile.letter.toUpperCase();
                    aPrefixTiles.push(oCurrentTile);
                } else {
                    break;
                }
            }

            // Reverse the string to have the prefix in the right order
            sPrefix = [...sPrefix].reverse().join('');

            // The suffix if all the placed letters after our tile
            let iSuffixRowNumber = oTile.rowNumber;
            let iSuffixColumnNumber = oTile.columnNumber;
            let sSuffix = '';
            let aSuffixTiles = [];
            while (iSuffixRowNumber < ScrabbleBoard.boardSize - 1) {
                iSuffixRowNumber += 1;
                let oCurrentTile = this.board[iSuffixRowNumber][iSuffixColumnNumber];
                if (oCurrentTile.letter) {
                    sSuffix += oCurrentTile.letter.toUpperCase();
                    aSuffixTiles.push(oCurrentTile);
                } else {
                    break;
                }
            }

            // No surrounding letters, go to next tile
            if (sPrefix === '' && sSuffix === '') {
                continue;
            }

            // At least one adjacent tile is filled, mark the tile as a possible anchor for a new word
            this.board[iRowNumber][iColumnNumber].isAnchor = true;

            // Update the across sum by adding the points for the suffix and prefix
            this.board[iRowNumber][iColumnNumber].verticalSum = this.calculateScoreForGivenTiles(aPrefixTiles) + this.calculateScoreForGivenTiles(aSuffixTiles);
            
            // Update the possible available letters of this tile
            this.updateVerticalAvailableLetters(sPrefix, oTile);
        }
    }

    updateHorizontalAvailableLetters(sPrefix, oTile) {
        // Use the prefix to iterate through the trie
        let oCurrentNode = this.dictionary.root;
        for (let sLetter of sPrefix) {
            oCurrentNode = oCurrentNode.children[sLetter];
        }

        // Check all possible letters to see if they can continue the prefix horizontally
        for (let sLetter of ScrabbleTools.getAlphabet()) {
            if (!(sLetter in oCurrentNode.children)) {
                if (this.board[oTile.rowNumber][oTile.columnNumber].horizontalAvailableLetters.indexOf(sLetter) !== -1) {
                    this.board[oTile.rowNumber][oTile.columnNumber].horizontalAvailableLetters.splice(this.board[oTile.rowNumber][oTile.columnNumber].horizontalAvailableLetters.indexOf(sLetter), 1);
                }
            }
        }
    }

    updateVerticalAvailableLetters(sPrefix, oTile) {
        // Use the prefix to iterate through the trie
        let oCurrentNode = this.dictionary.root;
        for (let sLetter of sPrefix) {
            oCurrentNode = oCurrentNode.children[sLetter];
        }

        // Check all possible letters to see if they can continue the prefix vertically
        for (let letter of ScrabbleTools.getAlphabet()) {
            if (!(letter in oCurrentNode.children)) {
                if (this.board[oTile.rowNumber][oTile.columnNumber].verticalAvailableLetters.indexOf(letter) !== -1) {
                    this.board[oTile.rowNumber][oTile.columnNumber].verticalAvailableLetters.splice(this.board[oTile.rowNumber][oTile.columnNumber].verticalAvailableLetters.indexOf(letter), 1);
                }
            }
        }
    }

    generateBestMoves() {
        let oTrieTree = this.dictionary;
        let aBoard = this.board;
        let aRack = this.rack;

        // Parsing the board by row then by column
        for (let aRow of aBoard) {
            for (let oTile of aRow) {
                // Available tiles for new words are marked as anchors
                if (!oTile.isAnchor) {
                    continue;
                }

                // If the current tile is not against the left border
                if (oTile.columnNumber > 0) {
                    let rowNumber = oTile.rowNumber;
                    let columnNumber = oTile.columnNumber - 1;
                    let oCurrentTile = aBoard[rowNumber][columnNumber];

                    let aPartialWord = [];
                    // If there are letters on the left, we retrieve them and try to build a "suffix" to extend the word
                    if (oCurrentTile.letter) {
                        while (oCurrentTile.letter) {
                            aPartialWord.push([oCurrentTile.letter, oCurrentTile.rowNumber, oCurrentTile.columnNumber]);
                            if (columnNumber <= 0) {
                                break;
                            }
                            columnNumber -= 1;
                            oCurrentTile = aBoard[rowNumber][columnNumber];
                        }
                        aPartialWord = aPartialWord.reverse();

                        let oCurrentNode = oTrieTree.root;
                        for (let aLetter of aPartialWord) {
                            // aLetter[0] is the actual alphabet letter, [1] is the row number, [2] is the column number
                            oCurrentNode = oCurrentNode.children[aLetter[0]];
                        }

                        // Generate "suffix" to complete the found letters and create a new word
                        this.generateSuffix(aPartialWord, aRack, oTile, "A", oCurrentNode);
                    } else {
                        // There is no letter on the left of the tile
                        let iLimit = 0;
                        // We count how many "blank" tiles are available
                        while (!oCurrentTile.isAnchor && columnNumber > 0 && iLimit < 11) {
                            iLimit += 1;
                            columnNumber -= 1;
                            oCurrentTile = aBoard[rowNumber][columnNumber];
                        }

                        // We try to generate a "prefix" to create a new word
                        this.generatePrefix([], iLimit - 1, aRack, oTile, "A");
                    }
                }

                // If the current tile is not against the top border
                if (oTile.rowNumber > 0) {
                    let rowNumber = oTile.rowNumber - 1;
                    let columnNumber = oTile.columnNumber;
                    let oCurrentTile = aBoard[rowNumber][columnNumber];
                    let aPartialWord = [];

                    // If there are letters on the top, we retrieve them and try to build a "suffix" to extend the word
                    if (oCurrentTile.letter) {
                        while (oCurrentTile.letter) {
                            aPartialWord.push([oCurrentTile.letter, oCurrentTile.rowNumber, oCurrentTile.columnNumber]);
                            if (rowNumber === 0) {
                                break;
                            }
                            rowNumber -= 1;
                            oCurrentTile = aBoard[rowNumber][columnNumber];
                        }

                        aPartialWord.reverse();

                        let oCurrentNode = oTrieTree.root;
                        for (let aLetter of aPartialWord) {
                            // aLetter[0] is the actual alphabet letter, [1] is the row number, [2] is the column number
                            oCurrentNode = oCurrentNode.children[aLetter[0]];
                        }

                        // Generate "suffix" to complete the found letters and create a new word
                        this.generateSuffix(aPartialWord, aRack, oTile, "D", oCurrentNode);
                    } else {
                        // There is no letter on the top of the tile
                        let iLimit = 0;
                        // We count how many "blank" tiles are available
                        while (!oCurrentTile.isAnchor && rowNumber > 0 && iLimit < 11) {
                            iLimit += 1;
                            rowNumber -= 1;
                            oCurrentTile = aBoard[rowNumber][columnNumber];
                        }

                        // We try to generate a "prefix" to create a new word
                        this.generatePrefix([], iLimit, aRack, oTile, "D");
                    }
                }
            }
        }
    }

    generatePrefix(partial_word, limit, rack, anchor, orientation, node = null) {
        if (!node) {
            node = this.dictionary.root;
        }
        this.generateSuffix(partial_word, rack, anchor, orientation, node);

        if (limit > 0) {
            for (let letter in node.children) {
                if (rack.indexOf(letter) !== -1) {
                    let child = node.children[letter];
                    rack.splice(rack.indexOf(child.letter), 1);

                    let rowNumber = anchor.rowNumber;
                    let columnNumber = anchor.columnNumber;
                    if (orientation === 'A') {
                        partial_word.push([letter, rowNumber, columnNumber - 1]);
                        for (let iOffsetCpt = 0; iOffsetCpt < partial_word.length; iOffsetCpt++) {
                            partial_word[iOffsetCpt][2] = columnNumber - (partial_word.length - iOffsetCpt);
                        }
                    } else {
                        partial_word.push([letter, rowNumber - 1, columnNumber])
                        for (let iOffsetCpt = 0; iOffsetCpt < partial_word.length; iOffsetCpt++) {
                            partial_word[iOffsetCpt][1] = rowNumber - (partial_word.length - iOffsetCpt);
                        }
                    }

                    this.generatePrefix(partial_word, limit - 1, rack, anchor, orientation, child);
                    partial_word.pop();
                    rack.push(child.letter);
                }
            }
        }
    }

    generateSuffix(partial_word, rack, tile, orientation, node) {
        if (tile.rowNumber >= ScrabbleBoard.boardSize - 1 || tile.columnNumber >= ScrabbleBoard.boardSize - 1) {
            if (node.terminate) {
                for (let letter of partial_word) {
                    if (this.board[letter[1]][letter[2]].isAnchor) {
                        this.evaluate_move(partial_word);
                        break;
                    }
                }
            }

            for (let letter in node.children) {
                if (rack.indexOf(letter) !== -1) {
                    if (orientation === 'A') {
                        if (tile.verticalAvailableLetters.indexOf(letter) === -1) {
                            continue;
                        }
                    } else if (tile.horizontalAvailableLetters.indexOf(letter) === -1) {
                        continue;
                    }

                    rack.splice(rack.indexOf(letter), 1);
                    partial_word.push([letter, tile.rowNumber, tile.columnNumber]);

                    if (node.children[letter].terminate) {
                        for (let letter of partial_word) {
                            if (this.board[letter[1]][letter[2]].isAnchor) {
                                this.evaluate_move(partial_word);
                                break;
                            }
                        }
                    }
                    partial_word.pop();
                    rack.push(letter);
                }
            }
        } else if (tile.letter === null || tile.letter === '') {
            if (node.terminate) {
                for (let letter of partial_word) {
                    if (this.board[letter[1]][letter[2]].isAnchor) {
                        this.evaluate_move(partial_word);
                        break;
                    }
                }
            }

            for (let letter in node.children) {
                if (rack.indexOf(letter) !== -1) {
                    if (orientation === 'A') {
                        if (tile.verticalAvailableLetters.indexOf(letter) === -1) {
                            continue;
                        }
                    } else if (tile.horizontalAvailableLetters.indexOf(letter) === -1) {
                        continue;
                    }

                    rack.splice(rack.indexOf(letter), 1);
                    partial_word.push([letter, tile.rowNumber, tile.columnNumber]);

                    let row = tile.rowNumber;
                    let col = tile.columnNumber;
                    let curr_cell = orientation === 'A' ? this.board[row][col + 1] : this.board[row + 1][col];

                    this.generateSuffix(partial_word, rack, curr_cell, orientation, node.children[letter]);
                    partial_word.pop();
                    rack.push(letter);
                }
            }
        } else {
            if (tile.letter in node.children) {
                partial_word.push([tile.letter, tile.rowNumber, tile.columnNumber]);
                let row = tile.rowNumber;
                let col = tile.columnNumber;
                let curr_cell = orientation === 'A' ? this.board[row][col + 1] : this.board[row + 1][col];
                this.generateSuffix(partial_word, rack, curr_cell, orientation, node.children[tile.letter]);
                partial_word.pop()
            }
        }
    }

    check_valid(cells_played) {
        if (!cells_played) {
            return false;
        }

        let connected = false
        for (let cell of cells_played) {
            if (cell.isAnchor) {
                connected = true;
            }
        }
        if (!connected) {
            return false;
        }

        if (cells_played.length === 1) {
            let cell = cells_played[0];
            return cell.letter in cell.verticalAvailableLetters && cell.letter in cell.horizontalAvailableLetters;
        }

        let word = [];
        if (cells_played[0].rowNumber === cells_played[1].rowNumber) {
            for (let cell of cells_played) {
                word.push(cell.letter)
                if (cell.verticalAvailableLetters.indexOf(cell.letter) === -1) {
                    return false;
                }
            }
        } else {
            for (let cell of cells_played) {
                word.push(cell.letter)
                if (cell.horizontalAvailableLetters.indexOf(cell.letter) === -1) {
                    return false;
                }
            }
        }

        let sWordString = word.join('').toUpperCase();

        return this.dictionary.valid_word(sWordString);
    }

    compute_score(cells_played) {
        let score = 0;
        let word_multiplier = 1;

        if (cells_played.length === 1) {
            for (let cell of cells_played) {
                if (cell.verticalSum > 0) {
                    score += cell.verticalSum + ScrabbleTools.getScoreByLetter(cell.letter) * cell.letterMultiplier;
                }
                if (cell.horizontalSum > 0) {
                    score += cell.horizontalSum + ScrabbleTools.getScoreByLetter(cell.letter) * cell.letterMultiplier;
                }
                word_multiplier *= cell.wordMuliplier;
            }
        } else if (cells_played[0].rowNumber === cells_played[1].rowNumber) {
            for (let cell of cells_played) {
                score += ScrabbleTools.getScoreByLetter(cell.letter) * cell.letterMultiplier;
                if (cell.verticalSum > 0) {
                    score += cell.verticalSum + ScrabbleTools.getScoreByLetter(cell.letter) * cell.letterMultiplier;
                }
                word_multiplier *= cell.wordMuliplier;
            }
        } else {
            for (let cell of cells_played) {
                score += ScrabbleTools.getScoreByLetter(cell.letter) * cell.letterMultiplier;
                if (cell.horizontalSum > 0) {
                    score += cell.horizontalSum + ScrabbleTools.getScoreByLetter(cell.letter) * cell.letterMultiplier;
                }
                word_multiplier *= cell.wordMuliplier;
            }
        }
        return score * word_multiplier;
    }

    evaluate_move(move) {
        let move_cell = [];
        for (let letter of move) {
            let board_cell = this.board[letter[1]][letter[2]];
            let copy_cell = _.cloneDeep(board_cell);
            copy_cell.letter = letter[0];
            move_cell.push(copy_cell);
        }

        if (!this.check_valid(move_cell)) {
            return;
        }

        let score = this.compute_score(move_cell);

        if (score > this.bestScore) {
            if (!this.check_all_formed_words(move)) {
                return;
            }
            this.bestMoves.push({'move': _.cloneDeep(this.bestMove).slice(), 'score': score});
            this.bestScore = score
            this.bestMove = _.cloneDeep(move).slice();
        }
    }

    check_all_formed_words(move) {
        let aValidationBoard = _.cloneDeep(this.board).slice();
        for (let aMove of move) {
            if (aValidationBoard[aMove[1]][aMove[2]].letter === '') {
                aValidationBoard[aMove[1]][aMove[2]].letter = aMove[0];
            }
        }
        let aFoundWords = [];
        let iConsecutiveLetter = 0;
        let sWord = '';
        for (let iValidationRowNumber = 0; iValidationRowNumber < ScrabbleBoard.boardSize; iValidationRowNumber++) {
            for (let iValidationColumnNumber = 0; iValidationColumnNumber < ScrabbleBoard.boardSize; iValidationColumnNumber++) {
                if (aValidationBoard[iValidationRowNumber][iValidationColumnNumber].letter !== '') {
                    iConsecutiveLetter++;
                    sWord += aValidationBoard[iValidationRowNumber][iValidationColumnNumber].letter;
                } else {
                    if (iConsecutiveLetter > 1) {
                        aFoundWords.push(sWord);
                    }
                    sWord = '';
                    iConsecutiveLetter = 0;
                }
            }
            if (iConsecutiveLetter > 1) {
                aFoundWords.push(sWord);
            }
            sWord = '';
            iConsecutiveLetter = 0;
        }

        for (let iValidationColumnNumber = 0; iValidationColumnNumber < ScrabbleBoard.boardSize; iValidationColumnNumber++) {
            for (let iValidationRowNumber = 0; iValidationRowNumber < ScrabbleBoard.boardSize; iValidationRowNumber++) {
                if (aValidationBoard[iValidationRowNumber][iValidationColumnNumber].letter !== '') {
                    iConsecutiveLetter++;
                    sWord += aValidationBoard[iValidationRowNumber][iValidationColumnNumber].letter;
                } else {
                    if (iConsecutiveLetter > 1) {
                        aFoundWords.push(sWord);
                    }
                    sWord = '';
                    iConsecutiveLetter = 0;
                }
            }
            if (iConsecutiveLetter > 1) {
                aFoundWords.push(sWord);
            }
            sWord = '';
            iConsecutiveLetter = 0;
        }

        for (let sValidationWord of aFoundWords) {
            if (!this.dictionary.valid_word(sValidationWord)) {
                return false;
            }
        }

        console.log(aFoundWords);
        return true;
    }
}
