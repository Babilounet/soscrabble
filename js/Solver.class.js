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
        this.wordError = '';
        this.bestScore = 1;

    }

    /**
     * Reset all the current computations for the board and initiate the finding of the best possible move with our current rack & board
     */
    findBestMove() {
        // Reset eventual previous moves
        this.bestMoves = [];
        this.bestMove = [];
        this.bestScore = 1;

        // Retrieve rack & board as array
        this.board = ScrabbleBoard.resetAnchorsAndAvailableLetter(ScrabbleBoard.getBoardAsArray());
        this.rack = ScrabbleRack.getRackAsArray();
        ScrabbleBoard.resetBoardMoves();

        if (!this.allFormedWordsAllowed([])) {
            ScrabbleBoard.setWordAsError(this.wordError, this.board);
            return;
        }

        // Initialise the available letters and anchors
        for (let iCpt = 0; iCpt < ScrabbleBoard.boardSize; iCpt++) {
            this.checkHorizontalValuesByRowNumber(iCpt);
            this.checkVerticalValuesByColumnNumber(iCpt);
        }

        // Process the datas to find the best move
        this.generateBestMoves();

        // If a move is found
        if (this.bestMove) {
            // Draw the best move on the board & the rack
            ScrabbleBoard.drawBoardBestMove(this.bestMove);
            ScrabbleRack.drawRackBestMove(this.bestMove);

            console.log(this);
        }
    }

    /**
     * Calculate a simple sum of the score of all given tiles
     * @param aTiles
     * @returns {int}
     */
    calculateScoreForGivenTiles(aTiles) {
        let iScore = 0;
        for (let aTile of aTiles) {
            iScore += ScrabbleTools.getScoreByLetter(aTile.letter);
        }
        return iScore;
    }

    /**
     * Check all tiles in the given row, update available letters and set anchors
     * @param {int} iRowNumber
     */
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

    /**
     * Check all tiles in the given column, update available letters and set anchors
     * @param {int} iColumnNumber
     */
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

    /**
     * Update the horizontal available letters for the given tile using the prefix
     * @param {string} sPrefix
     * @param {Tile} oTile
     */
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

    /**
     * Update the vertical available letters for the given tile using the prefix
     * @param {string} sPrefix
     * @param {Tile} oTile
     */
    updateVerticalAvailableLetters(sPrefix, oTile) {
        // Use the prefix to iterate through the trie
        let oCurrentNode = this.dictionary.root;
        for (let sLetter of sPrefix) {
            oCurrentNode = oCurrentNode.children[sLetter];
        }

        // Check all possible letters to see if they can continue the prefix vertically
        for (let sLetter of ScrabbleTools.getAlphabet()) {
            if (!(sLetter in oCurrentNode.children)) {
                if (this.board[oTile.rowNumber][oTile.columnNumber].verticalAvailableLetters.indexOf(sLetter) !== -1) {
                    this.board[oTile.rowNumber][oTile.columnNumber].verticalAvailableLetters.splice(this.board[oTile.rowNumber][oTile.columnNumber].verticalAvailableLetters.indexOf(sLetter), 1);
                }
            }
        }
    }

    /**
     * Process the current board and rack to find the best move
     */
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

                (oTile.rowNumber === 4 && oTile.columnNumber === 8) ? this.log = true : this.log = false;

                // If the current tile is not against the left border
                if (oTile.columnNumber > 0) {
                    let iRowNumber = oTile.rowNumber;
                    let iColumnNumber = oTile.columnNumber - 1;
                    let oCurrentTile = aBoard[iRowNumber][iColumnNumber];

                    let aPartialWord = [];
                    // If there are letters on the left, we retrieve them and try to build a "suffix" to extend the word
                    if (oCurrentTile.letter) {
                        while (oCurrentTile.letter) {
                            aPartialWord.push([oCurrentTile.letter, oCurrentTile.rowNumber, oCurrentTile.columnNumber]);
                            if (iColumnNumber <= 0) {
                                break;
                            }
                            iColumnNumber -= 1;
                            oCurrentTile = aBoard[iRowNumber][iColumnNumber];
                        }
                        aPartialWord = aPartialWord.reverse();

                        let oCurrentNode = oTrieTree.root;
                        for (let aLetter of aPartialWord) {
                            // aLetter[0] is the actual alphabet letter, [1] is the row number, [2] is the column number
                            oCurrentNode = oCurrentNode.children[aLetter[0]];
                        }

                        // Generate "suffix" to complete the found letters and create a new word
                        this.generateSuffix(aPartialWord, aRack, oTile, 'A', oCurrentNode);
                    } else {
                        // There is no letter on the left of the tile
                        let iLimit = 0;
                        // We count how many "blank" tiles are available
                        while (!oCurrentTile.isAnchor && iColumnNumber > 0 && iLimit < 11) {
                            iLimit += 1;
                            iColumnNumber -= 1;
                            oCurrentTile = aBoard[iRowNumber][iColumnNumber];
                        }

                        // We try to generate a "prefix" to create a new word
                        this.generatePrefix([], iLimit - 1, aRack, oTile, 'A');
                    }
                }

                // If the current tile is not against the top border
                if (oTile.rowNumber > 0) {
                    let iRowNumber = oTile.rowNumber - 1;
                    let iColumnNumber = oTile.columnNumber;
                    let oCurrentTile = aBoard[iRowNumber][iColumnNumber];
                    let aPartialWord = [];

                    // If there are letters on the top, we retrieve them and try to build a "suffix" to extend the word
                    if (oCurrentTile.letter) {
                        while (oCurrentTile.letter) {
                            aPartialWord.push([oCurrentTile.letter, oCurrentTile.rowNumber, oCurrentTile.columnNumber]);
                            if (iRowNumber === 0) {
                                break;
                            }
                            iRowNumber -= 1;
                            oCurrentTile = aBoard[iRowNumber][iColumnNumber];
                        }

                        aPartialWord.reverse();

                        let oCurrentNode = oTrieTree.root;
                        for (let aLetter of aPartialWord) {
                            // aLetter[0] is the actual alphabet letter, [1] is the row number, [2] is the column number
                            oCurrentNode = oCurrentNode.children[aLetter[0]];
                        }

                        // Generate "suffix" to complete the found letters and create a new word
                        this.generateSuffix(aPartialWord, aRack, oTile, 'D', oCurrentNode);
                    } else {
                        // There is no letter on the top of the tile
                        let iLimit = 0;
                        // We count how many "blank" tiles are available
                        while (!oCurrentTile.isAnchor && iRowNumber > 0 && iLimit < 11) {
                            iLimit += 1;
                            iRowNumber -= 1;
                            oCurrentTile = aBoard[iRowNumber][iColumnNumber];
                        }

                        // We try to generate a "prefix" to create a new word
                        this.generatePrefix([], iLimit, aRack, oTile, 'D');
                    }
                }
            }
        }
    }

    /**
     * Create the first characters of the new move using the letters in the rack
     * @param {array} aPartialWord
     * @param {int} iLimit
     * @param {array} aRack
     * @param {Tile} oTile
     * @param {string} sOrientation A or D for (A)cross or (D)own
     * @param {Node} oNode
     */
    generatePrefix(aPartialWord, iLimit, aRack, oTile, sOrientation, oNode = null) {
        if (!oNode) {
            oNode = this.dictionary.root;
        }

        this.generateSuffix(aPartialWord, aRack, oTile, sOrientation, oNode);

        // If we have any free tile to fill
        if (iLimit >= 0) {
            // For every possible "next-letter" in our word
            for (let sLetter in oNode.children) {
                // Check if we have this "next-letter" in our rack
                if (aRack.indexOf(sLetter) !== -1) {
                    // Move to the next letter in the trie
                    let aNodeChildren = oNode.children[sLetter];
                    // Remove the letter we just "played" from the rack
                    aRack.splice(aRack.indexOf(aNodeChildren.letter), 1);

                    // Move our WIP word from one tile left or up, depending on the orientation
                    let iRowNumber = oTile.rowNumber;
                    let iColumnNumber = oTile.columnNumber;
                    if (sOrientation === 'A') {
                        aPartialWord.push([sLetter, iRowNumber, iColumnNumber - 1]);
                        for (let iOffsetCpt = 0; iOffsetCpt < aPartialWord.length; iOffsetCpt++) {
                            aPartialWord[iOffsetCpt][2] = iColumnNumber - (aPartialWord.length - iOffsetCpt);
                        }
                    } else {
                        aPartialWord.push([sLetter, iRowNumber - 1, iColumnNumber])
                        for (let iOffsetCpt = 0; iOffsetCpt < aPartialWord.length; iOffsetCpt++) {
                            aPartialWord[iOffsetCpt][1] = iRowNumber - (aPartialWord.length - iOffsetCpt);
                        }
                    }

                    // Continue building the prefix with one less tile available
                    this.generatePrefix(aPartialWord, iLimit - 1, aRack, oTile, sOrientation, aNodeChildren);
                    aPartialWord.pop();
                    // Put back our letter in the rack for the next letter
                    aRack.push(aNodeChildren.letter);
                } else if (aRack.indexOf(' ') !== -1) {
                    // Move to the next letter in the trie
                    let aNodeChildren = oNode.children[sLetter];
                    // Remove the letter we just "played" from the rack
                    aRack.splice(aRack.indexOf(' '), 1);

                    // Move our WIP word from one tile left or up, depending on the orientation
                    let iRowNumber = oTile.rowNumber;
                    let iColumnNumber = oTile.columnNumber;
                    if (sOrientation === 'A') {
                        aPartialWord.push([sLetter, iRowNumber, iColumnNumber - 1, true]);
                        for (let iOffsetCpt = 0; iOffsetCpt < aPartialWord.length; iOffsetCpt++) {
                            aPartialWord[iOffsetCpt][2] = iColumnNumber - (aPartialWord.length - iOffsetCpt);
                        }
                    } else {
                        aPartialWord.push([sLetter, iRowNumber - 1, iColumnNumber, true])
                        for (let iOffsetCpt = 0; iOffsetCpt < aPartialWord.length; iOffsetCpt++) {
                            aPartialWord[iOffsetCpt][1] = iRowNumber - (aPartialWord.length - iOffsetCpt);
                        }
                    }

                    // Continue building the prefix with one less tile available
                    this.generatePrefix(aPartialWord, iLimit - 1, aRack, oTile, sOrientation, aNodeChildren);
                    aPartialWord.pop();
                    // Put back our letter in the rack for the next letter
                    aRack.push(' ');
                }
            }
        }
    }

    /**
     * Create the last letters of the new word with the current rack
     * @param {array} aPartialWord An array of arrays each representing a tile, each array have at least [0] letter, [1] row number, [2] column number, [3] true : tile is joker, false tile is already placed on the board
     * @param {array} aRack
     * @param {Tile} oTile
     * @param {string} sOrientation A or D for (A)cross or (D)own
     * @param {Node} oNode
     */
    generateSuffix(aPartialWord, aRack, oTile, sOrientation, oNode) {
        // If we reach the end of the board
        if (oTile.rowNumber >= ScrabbleBoard.boardSize - 1 || oTile.columnNumber >= ScrabbleBoard.boardSize - 1) {
            // If the last tile is terminating a word, evaluate this move
            if (oNode.terminate) {
                for (let aLetter of aPartialWord) {
                    if (this.board[aLetter[1]][aLetter[2]].isAnchor) {
                        this.evaluateMove(aPartialWord);
                        break;
                    }
                }
            }

            if (oTile.letter in oNode.children) {
                aPartialWord.push([oTile.letter, oTile.rowNumber, oTile.columnNumber, false]);
                if (oNode.children[oTile.letter].terminate) {
                    for (let aLetter of aPartialWord) {
                        if (this.board[aLetter[1]][aLetter[2]].isAnchor) {
                            this.evaluateMove(aPartialWord);
                            break;
                        }
                    }
                }
                aPartialWord.pop();
            } else {
                // One last try to add a letter
                for (let sLetter in oNode.children) {
                    if (aRack.indexOf(sLetter) !== -1) {
                        if (sOrientation === 'A') {
                            if (oTile.verticalAvailableLetters.indexOf(sLetter) === -1) {
                                continue;
                            }
                        } else if (oTile.horizontalAvailableLetters.indexOf(sLetter) === -1) {
                            continue;
                        }

                        // Remove letter from rack & add it to the word
                        aRack.splice(aRack.indexOf(sLetter), 1);
                        aPartialWord.push([sLetter, oTile.rowNumber, oTile.columnNumber]);

                        // Check if the word is valid
                        if (oNode.children[sLetter].terminate) {
                            for (let aLetter of aPartialWord) {
                                if (this.board[aLetter[1]][aLetter[2]].isAnchor) {
                                    this.evaluateMove(aPartialWord);
                                    break;
                                }
                            }
                        }
                        aPartialWord.pop();
                        aRack.push(sLetter);
                    } else if (aRack.indexOf(' ') !== -1) {
                        if (sOrientation === 'A') {
                            if (oTile.verticalAvailableLetters.indexOf(sLetter) === -1) {
                                continue;
                            }
                        } else if (oTile.horizontalAvailableLetters.indexOf(sLetter) === -1) {
                            continue;
                        }

                        // Remove letter from rack & add it to the word
                        aRack.splice(aRack.indexOf(' '), 1);
                        aPartialWord.push([sLetter, oTile.rowNumber, oTile.columnNumber, true]);

                        // Check if the word is valid
                        if (oNode.children[sLetter].terminate) {
                            for (let aLetter of aPartialWord) {
                                if (this.board[aLetter[1]][aLetter[2]].isAnchor) {
                                    for (let aMoveLetter in aPartialWord) {
                                        if (aMoveLetter[0] === aLetter && aMoveLetter.length < 4) {
                                            
                                        }
                                    }
                                    this.evaluateMove(aPartialWord);
                                    break;
                                }
                            }
                        }
                        aPartialWord.pop();
                        aRack.push(' ');
                    }
                }
            }
        } else if (oTile.letter === null || oTile.letter === '') {
            // Check if the word is valid without adding anything
            if (oNode.terminate) {
                for (let aLetter of aPartialWord) {
                    if (this.board[aLetter[1]][aLetter[2]].isAnchor) {
                        this.evaluateMove(aPartialWord);
                        break;
                    }
                }
            }

            // Check if there is any matching letter between rack and "next-letter" in our trie
            for (let sLetter in oNode.children) {
                if (aRack.indexOf(sLetter) !== -1) {
                    if (sOrientation === 'A') {
                        if (oTile.verticalAvailableLetters.indexOf(sLetter) === -1) {
                            continue;
                        }
                    } else if (oTile.horizontalAvailableLetters.indexOf(sLetter) === -1) {
                        continue;
                    }

                    // Remove letter from rack & add it to the word
                    aRack.splice(aRack.indexOf(sLetter), 1);
                    aPartialWord.push([sLetter, oTile.rowNumber, oTile.columnNumber]);

                    let iRowNumber = oTile.rowNumber;
                    let iColumnNumber = oTile.columnNumber;
                    let oCurrentTile = sOrientation === 'A' ? this.board[iRowNumber][iColumnNumber + 1] : this.board[iRowNumber + 1][iColumnNumber];

                    // Continue adding letter recursively (the word we just built will be check in the next iteration)
                    this.generateSuffix(aPartialWord, aRack, oCurrentTile, sOrientation, oNode.children[sLetter]);
                    aPartialWord.pop();
                    aRack.push(sLetter);
                } else if (aRack.indexOf(' ') !== -1) {
                    if (sOrientation === 'A') {
                        if (oTile.verticalAvailableLetters.indexOf(sLetter) === -1) {
                            continue;
                        }
                    } else if (oTile.horizontalAvailableLetters.indexOf(sLetter) === -1) {
                        continue;
                    }

                    // Remove letter from rack & add it to the word
                    aRack.splice(aRack.indexOf(' '), 1);
                    aPartialWord.push([sLetter, oTile.rowNumber, oTile.columnNumber, true]);

                    let iRowNumber = oTile.rowNumber;
                    let iColumnNumber = oTile.columnNumber;
                    let oCurrentTile = sOrientation === 'A' ? this.board[iRowNumber][iColumnNumber + 1] : this.board[iRowNumber + 1][iColumnNumber];

                    // Continue adding letter recursively (the word we just built will be check in the next iteration)
                    this.generateSuffix(aPartialWord, aRack, oCurrentTile, sOrientation, oNode.children[sLetter]);
                    aPartialWord.pop();
                    aRack.push(' ');

                }
            }
        } else {
            // Tile is already on the board
            if (oTile.letter in oNode.children) {
                aPartialWord.push([oTile.letter, oTile.rowNumber, oTile.columnNumber, false]);
                let iRowNumber = oTile.rowNumber;
                let iColumnNumber = oTile.columnNumber;
                let oCurrentTile = sOrientation === 'A' ? this.board[iRowNumber][iColumnNumber + 1] : this.board[iRowNumber + 1][iColumnNumber];
                this.generateSuffix(aPartialWord, aRack, oCurrentTile, sOrientation, oNode.children[oTile.letter]);
                aPartialWord.pop();
            }
        }
    }

    /**
     * Check if the given letters are available in the tiles they predict to be in
     * @param {array} aMove An array of arrays each representing a tile, each array have at least [0] letter, [1] row number, [2] column number, [3] true : tile is joker, false tile is already placed on the board
     * @returns {boolean}
     */
    isMoveValid(aMove) {
        if (!aMove) {
            return false;
        }

        let bConnected = false
        for (let oTile of aMove) {
            if (oTile.isAnchor) {
                bConnected = true;
            }
        }
        if (!bConnected) {
            return false;
        }

        // If move is only one letter long, only check that the played letter was available both horizontally & vertically
        if (aMove.length === 1) {
            let oTile = aMove[0];
            return oTile.letter in oTile.verticalAvailableLetters && oTile.letter in oTile.horizontalAvailableLetters;
        }

        let aWord = [];
        // Word is horizontal
        if (aMove[0].rowNumber === aMove[1].rowNumber) {
            for (let oTile of aMove) {
                aWord.push(oTile.letter)
                // Check for each letter that it is available horizontally
                if (oTile.verticalAvailableLetters.indexOf(oTile.letter) === -1) {
                    return false;
                }
            }
        } else {
            for (let cell of aMove) {
                aWord.push(cell.letter)
                // Check for each letter that it is available vertically
                if (cell.horizontalAvailableLetters.indexOf(cell.letter) === -1) {
                    return false;
                }
            }
        }

        // Check that the word exist in our dictionary
        let sWordString = aWord.join('').toUpperCase();
        return this.dictionary.isWordValid(sWordString);
    }

    /**
     * Calculate the score fot the given move
     * @param {array<Tile>} aMoveTiles
     * @returns {int}
     */
    calculateScoreForMove(aMoveTiles) {
        let iScore = 0;
        let iWordMultiplier = 1;

        // One letter move
        if (aMoveTiles.length === 1) {
            let oTile = aMoveTiles[0];
            oTile.verticalSum = oTile.isJoker ? 0 : oTile.verticalSum;
            oTile.horizontalSum = oTile.isJoker ? 0 : oTile.horizontalSum;
            oTile.wordMuliplier = oTile.alreadyOnBoard ? 1 : oTile.wordMuliplier;
            oTile.letterMultiplier = oTile.alreadyOnBoard ? 1 : oTile.letterMultiplier;

            if (oTile.verticalSum > 0) {
                iScore += oTile.verticalSum + (ScrabbleTools.getScoreByLetter(oTile.letter) * oTile.letterMultiplier);
            }
            if (oTile.horizontalSum > 0) {
                iScore += oTile.horizontalSum + (ScrabbleTools.getScoreByLetter(oTile.letter) * oTile.letterMultiplier);
            }
            iWordMultiplier *= oTile.wordMuliplier;
            // Horizontal move
        } else if (aMoveTiles[0].rowNumber === aMoveTiles[1].rowNumber) {
            for (let oTile of aMoveTiles) {
                oTile.verticalSum = oTile.isJoker ? 0 : oTile.verticalSum;
                oTile.horizontalSum = oTile.isJoker ? 0 : oTile.horizontalSum;
                oTile.wordMuliplier = oTile.alreadyOnBoard ? 1 : oTile.wordMuliplier;
                oTile.letterMultiplier = oTile.alreadyOnBoard ? 1 : oTile.letterMultiplier;

                if (!oTile.isJoker) {
                    iScore += ScrabbleTools.getScoreByLetter(oTile.letter) * oTile.letterMultiplier;
                }
                if (oTile.verticalSum > 0) {
                    iScore += oTile.verticalSum + (ScrabbleTools.getScoreByLetter(oTile.letter) * oTile.letterMultiplier);
                }
                iWordMultiplier *= oTile.wordMuliplier;
            }
            // Vertical move
        } else {
            for (let oTile of aMoveTiles) {
                oTile.verticalSum = oTile.isJoker ? 0 : oTile.verticalSum;
                oTile.horizontalSum = oTile.isJoker ? 0 : oTile.horizontalSum;
                oTile.wordMuliplier = oTile.alreadyOnBoard ? 1 : oTile.wordMuliplier;
                oTile.letterMultiplier = oTile.alreadyOnBoard ? 1 : oTile.letterMultiplier;

                if (!oTile.isJoker) {
                    iScore += ScrabbleTools.getScoreByLetter(oTile.letter) * oTile.letterMultiplier;
                }
                if (oTile.horizontalSum > 0) {
                    iScore += oTile.horizontalSum + (ScrabbleTools.getScoreByLetter(oTile.letter) * oTile.letterMultiplier);
                }
                iWordMultiplier *= oTile.wordMuliplier;
            }
        }
        return iScore * iWordMultiplier;
    }

    /**
     * Check the validity of the given move and compare it to the current best move. Set it as best move if the score is better
     * @param {array} aMove An array of arrays each representing a tile, each array have at least [0] letter, [1] row number, [2] column number, [3] true : tile is joker, false tile is already placed on the board
     */
    evaluateMove(aMove) {
        let aMoveTiles = [];

        (ScrabbleTools.getStringWordFromMove(aMove) === 'POUFFA') ? this.loglog = true : this.loglog = false;
        // Retrieve tiles corresponding to the move and create a deep copy for testing without altering the board
        for (let aLetter of aMove) {
            if (this.board[aLetter[1]][aLetter[2]].letter === aLetter[0]) {
                aLetter[3] = false;
            }
            let oCopiedTile = _.cloneDeep(this.board[aLetter[1]][aLetter[2]]);
            oCopiedTile.letter = aLetter[0];
            // Third param of move give information on if the tile is a joker or an already set tile on the board
            if (aLetter.length === 4) {
                aLetter[3] ? oCopiedTile.isJoker = true : oCopiedTile.alreadyOnBoard = true;
            }
            aMoveTiles.push(oCopiedTile);
        }
        if (this.loglog) console.log(_.cloneDeep(aMove));

        if (!this.isMoveValid(aMoveTiles)) {
            return;
        }
        if (this.loglog) console.log('aaaa');

        // Retrieve score
        let iScore = this.calculateScoreForMove(aMoveTiles);
        if (this.loglog) console.log(iScore);

        // Ignore the move if we already tested a better solution
        if (iScore >= this.bestScore) {
            // Check the all word formed by this move are valid words
            if (!this.allFormedWordsAllowed(aMove)) {
                return;
            }

            // List progress of the scores
            this.bestMoves.push({'move': _.cloneDeep(this.bestMove).slice(), 'score': iScore});
            // Change the current best move
            this.bestScore = iScore
            this.bestMove = _.cloneDeep(aMove).slice();
        }
    }

    /**
     *  Check if all words generated by the move are valid words in our dictionary
     * @param {array} aMove An array of arrays each representing a tile, each array have at least [0] letter, [1] row number, [2] column number, [3] true : tile is joker, false tile is already placed on the board
     * @returns {boolean}
     */
    allFormedWordsAllowed(aMove) {
        this.wordError = '';
        // Clone the board to test the move without altering the real board
        let aValidationBoard = _.cloneDeep(this.board).slice();
        // Place the move letters on the cloned board
        for (let aLetter of aMove) {
            if (aValidationBoard[aLetter[1]][aLetter[2]].letter === '') {
                aValidationBoard[aLetter[1]][aLetter[2]].letter = aLetter[0];
                // Move try to override an existing letter
            } else if (aValidationBoard[aLetter[1]][aLetter[2]].letter !== aLetter[0]) {
                return false;
            }
        }
        let aFoundWords = [];
        let iConsecutiveLetter = 0;
        let sWord = '';

        // Find all word row by row, horizontally , a word is any 2 consecutive letters
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
            // If we still have consecutive letter count at the end of row, the word is touching the end of board
            if (iConsecutiveLetter > 1) {
                aFoundWords.push(sWord);
            }
            sWord = '';
            iConsecutiveLetter = 0;
        }

        // Find all word column by column, vertically, a word is any 2 consecutive letters
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
            // If we still have consecutive letter count at the end of column, the word is touching the end of board
            if (iConsecutiveLetter > 1) {
                aFoundWords.push(sWord);
            }
            sWord = '';
            iConsecutiveLetter = 0;
        }

        // Check for each found words that they are valid
        for (let sValidationWord of aFoundWords) {
            if (!this.dictionary.isWordValid(sValidationWord)) {
                this.wordError = sValidationWord;
                return false;
            }
        }

        return true;
    }
}
