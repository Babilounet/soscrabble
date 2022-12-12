import {TrieTree} from "./TrieTree.class.js";
import {ScrabbleTools} from "./ScrabbleTools.class.js";
import {ScrabbleRack} from "./ScrabbleRack.class.js";
import {ScrabbleBoard} from "./ScrabbleBoard.class.js";

export class Solver {

    constructor(sDictionaryFilePath) {
        this.board = [];
        this.rack = [];
        this.dictionary = new TrieTree(sDictionaryFilePath);
        this.best_move = [];
        this.best_score = 1;

    }

    findBestMove() {
        this.board = ScrabbleBoard.getBoardAsArray();
        console.log(this.board);
        this.rack = ScrabbleRack.getRackAsArray()
        for (let iCpt = 0; iCpt < ScrabbleBoard.boardSize; iCpt++) {
            this.across_check(iCpt);
            this.down_check(iCpt);
        }
        this.generate_moves();
        if (this.best_move) {
            ScrabbleBoard.drawBoardBestMove(this.best_move);
            ScrabbleRack.drawRackBestMove(this.best_move);
        }
    }

    compute_score_already_placed(cells_played) {
        let score = 0;
        for (let cell of cells_played) {
            score += ScrabbleTools.getScoreByLetter(cell.letter);
        }
        return score;
    }

    across_check(row) {
        for (let cellKey in this.board[row]) {
            let cell = this.board[row][cellKey];
            this.board[row][cellKey].horizontalAvailableLetters = ScrabbleTools.getAlphabet();

            // If the letter is already placed then skip
            if (cell.letter) {
                continue;
            }
            let prefix_row = cell.rowNumber;
            let prefix_col = cell.columnNumber;

            // Build the prefix of all the words before this letter
            let prefix = [];
            let prefix_cell = [];
            while (prefix_col > 0) {
                prefix_col -= 1;
                let cur_cell = this.board[prefix_row][prefix_col];
                if (cur_cell.letter) {
                    prefix.push(cur_cell.letter);
                    prefix_cell.push(cur_cell);
                } else {
                    break;
                }
            }

            prefix.reverse()

            // Build the suffix of all letters after this one
            let suffix_row = cell.rowNumber;
            let suffix_col = cell.columnNumber;
            let suffix = [];
            let suffix_cell = [];
            while (suffix_col < ScrabbleBoard.boardSize - 1) {
                suffix_col += 1;
                let cur_cell = this.board[suffix_row][suffix_col];
                if (cur_cell.letter) {
                    suffix.push(cur_cell.letter);
                    suffix_cell.push(cur_cell);
                } else {
                    break;
                }
            }

            prefix = prefix.join('').toUpperCase();
            suffix = suffix.join('').toUpperCase();

            // If their are no letters to the left or right then no letters need to be removed from
            // the across_check
            if (prefix === '' && suffix === '') {
                continue;
            }

            // Cell is empty but adjacent to a placed tile so it can be the start of a new word
            this.board[row][cellKey].isAnchor = true;

            // Update the across sum by adding the points for the suffix and prefix
            this.board[row][cellKey].horizontalSum = this.compute_score_already_placed(prefix_cell) + this.compute_score_already_placed(suffix_cell);
            // Update the across check for the cell
            this.update_across_check(prefix, suffix, cell);

        }
    }

    down_check(col) {
        for (let rowKey in this.board) {
            let cell = this.board[rowKey][col];

            this.board[rowKey][col].verticalAvailableLetters = ScrabbleTools.getAlphabet();

            // If the letter is already placed then skip it
            if (cell.letter) {
                continue;
            }

            let prefix_row = cell.rowNumber;
            let prefix_col = cell.columnNumber;

            // Build the prefix of the letter above the current cell
            let prefix = [];
            let prefix_cell = [];
            while (prefix_row > 0) {
                prefix_row -= 1
                let cur_cell = this.board[prefix_row][prefix_col];
                if (cur_cell.letter) {
                    prefix.push(cur_cell.letter);
                    prefix_cell.push(cur_cell);
                } else {
                    break;
                }
            }

            prefix.reverse()

            // Build the suffix of the letter below the current cell
            let suffix_row = cell.rowNumber;
            let suffix_col = cell.columnNumber;
            let suffix = [];
            let suffix_cell = [];

            while (suffix_row < ScrabbleBoard.boardSize - 1) {
                suffix_row += 1;
                let cur_cell = this.board[suffix_row][suffix_col];
                if (cur_cell.letter) {
                    suffix.push(cur_cell.letter);
                    suffix_cell.push(cur_cell);
                } else {
                    break;
                }
            }

            prefix = prefix.join('').toUpperCase();
            suffix = suffix.join('').toUpperCase();

            // If the cell has nothing above or below it then no need to remove letter
            // from the down_check
            if (prefix === '' && suffix === '') {
                continue;
            }

            // Cell is empty but adjacent to a placed tile so it canbe the start of a new word
            this.board[rowKey][col].isAnchor = true;

            // Update the down sum using the prefix and suffix
            this.board[rowKey][col].verticalSum = this.compute_score_already_placed(prefix_cell) + this.compute_score_already_placed(suffix_cell);
            // Update the down check
            this.update_down_check(prefix, suffix, cell);
        }
    }

    update_across_check(prefix, suffix, tile) {
        // Use the prefix to iterate through the trie
        let curr_node = this.dictionary.root;
        for (let letter of prefix) {
            curr_node = curr_node.children[letter];
        }

        // Check all possible letters to see if they can make valid across checks
        for (let letter of ScrabbleTools.getAlphabet()) {
            // Remove if the letter is not a child of the current node
            if (!(letter in curr_node.children)) {
                if (tile.horizontalAvailableLetters.indexOf(letter) !== -1) {
                    this.board[tile.rowNumber][tile.columnNumber].horizontalAvailableLetters.splice(tile.horizontalAvailableLetters.indexOf(letter), 1);
                }
                continue;
            }
            // Remove if that letter does not form a valid word
            if (!this.dictionary.valid_word(suffix, curr_node.children[letter])) {
                if (tile.horizontalAvailableLetters.indexOf(letter) !== -1) {
                    this.board[tile.rowNumber][tile.columnNumber].horizontalAvailableLetters.splice(tile.horizontalAvailableLetters.indexOf(letter), 1);
                }
            }
        }
    }

    update_down_check(prefix, suffix, tile) {
        // Use the prefix to iterate through the trie
        let curr_node = this.dictionary.root;
        for (let letter of prefix) {
            curr_node = curr_node.children[letter];
        }

        // Check all possible letters to see if they can make valid down checks
        for (let letter of ScrabbleTools.getAlphabet()) {
            // Remove if the letter is not a child of the current node
            if (!(letter in curr_node.children)) {
                if (tile.verticalAvailableLetters.indexOf(letter) !== -1) {
                    this.board[tile.rowNumber][tile.columnNumber].verticalAvailableLetters.splice(tile.verticalAvailableLetters.indexOf(letter), 1);
                }
                continue;
            }
            // Remove if that letter does not form a valid word
            if (!this.dictionary.valid_word(suffix, curr_node.children[letter])) {
                if (tile.verticalAvailableLetters.indexOf(letter) !== -1) {
                    this.board[tile.rowNumber][tile.columnNumber].verticalAvailableLetters.splice(tile.verticalAvailableLetters.indexOf(letter), 1);
                }
            }
        }
    }

    cross_checks_sums(cells_played) {
        if (cells_played.length === 1) {
            this.down_check(cells_played[0].columnNumber);
            this.across_check(cells_played[0].rowNumber);
        } else if (cells_played[0].rowNumber === cells_played[1].rowNumber) {
            this.across_check(cells_played[0].rowNumber);
            for (let cell in cells_played) {
                this.down_check(cell.columnNumber);
            }
        } else {
            this.down_check(cells_played[0].columnNumber);
            for (let cell in cells_played) {
                this.across_check(cell.rowNumber);
            }
        }
    }

    generate_moves() {
        let trie = this.dictionary;
        let board = this.board;
        let rack = this.rack;
        for (let row of board) {
            for (let tile of row) {
                if (!tile.isAnchor) {
                    continue;
                }

                let rowNumber = tile.rowNumber;
                let columnNumber = tile.columnNumber;
                let curr_cell = board[rowNumber][columnNumber];

                let partial_word = [];

                if (curr_cell.letter) {
                    while (curr_cell.letter) {
                        partial_word.push([curr_cell.letter, curr_cell.rowNumber, curr_cell.columnNumber]);
                        if (columnNumber === 0) {
                            break;
                        }
                        columnNumber -= 1;
                        curr_cell = board[rowNumber][columnNumber];
                    }
                    partial_word = partial_word.reverse();

                    let node = trie.root;
                    for (let item of partial_word) {
                        node = node.children[item[0]];
                    }

                    this.generate_suffix(partial_word, rack, tile, "A", node);
                } else {
                    let limit = 0;
                    while (!curr_cell.isAnchor && columnNumber > 0 && limit < 8) {
                        limit += 1;
                        columnNumber -= 1;
                        curr_cell = board[rowNumber][columnNumber];
                    }

                    this.generate_prefix([], limit - 1, rack, tile, "A");
                }

                rowNumber = tile.rowNumber;
                columnNumber = tile.columnNumber;
                curr_cell = board[rowNumber][columnNumber];

                partial_word = [];

                if (curr_cell.letter) {
                    while (curr_cell.letter) {
                        partial_word.push([curr_cell.letter, curr_cell.rowNumber, curr_cell.columnNumber]);
                        if (rowNumber === 0) {
                            break;
                        }
                        rowNumber -= 1;
                        curr_cell = board[rowNumber][columnNumber];
                    }

                    partial_word.reverse();

                    let node = trie.root;
                    for (let item of partial_word) {
                        node = node.children[item[0]];
                    }

                    this.generate_suffix(partial_word, rack, tile, "D", node)
                } else {
                    let limit = 0
                    while (!curr_cell.isAnchor && rowNumber > 0 && limit < 8) {
                        limit += 1
                        rowNumber -= 1
                        curr_cell = board[rowNumber][columnNumber]
                    }
                    this.generate_prefix([], limit - 1, rack, tile, "D")
                }
            }
        }
    }

    generate_prefix(partial_word, limit, rack, anchor, orientation, node = null) {
        if (!node) {
            node = this.dictionary.root;
        }

        this.generate_suffix(partial_word, rack, anchor, orientation, node);

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

                    this.generate_prefix(partial_word, limit - 1, rack, anchor, orientation, child)
                    partial_word.pop()
                    rack.push(child.letter)
                }
            }
        }
    }

    generate_suffix(partial_word, rack, tile, orientation, node) {
        if (tile.rowNumber > ScrabbleBoard.boardSize - 2 || tile.columnNumber > ScrabbleBoard.boardSize - 2) {
            if (node.terminate) {
                for (let letter of partial_word) {
                    if (this.board[letter[1]][letter[2]].isAnchor) {
                        this.evaluate_move(partial_word);
                        break;
                    }
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

                    this.generate_suffix(partial_word, rack, curr_cell, orientation, node.children[letter]);
                    partial_word.pop();
                    rack.push(letter);
                }
            }
        } else {
            if (tile.letter in node.children) {
                partial_word.push([tile.letter, tile.rowNumber, tile.columnNumber])
                let row = tile.rowNumber;
                let col = tile.columnNumber;
                let curr_cell = orientation === 'A' ? this.board[row][col + 1] : this.board[row + 1][col];
                this.generate_suffix(partial_word, rack, curr_cell, orientation, node.children[tile.letter]);
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

        if (score > this.best_score) {
            this.best_score = score
            this.best_move = _.cloneDeep(move).slice();
        }
    }

    best_move_cell() {
        let move_cell = [];
        for (let letter of this.best_move) {
            this.board[letter[1]][letter[2]].letter = letter[0];
            move_cell.push(this.board[letter[1]][letter[2]]);
        }

        return move_cell;
    }
}
