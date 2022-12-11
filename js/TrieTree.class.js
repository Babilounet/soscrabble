import {Node} from "./Node.class.js";
import {ScrabbleTools} from "./ScrabbleTools.class.js";

export class TrieTree {
    constructor(sDictionaryFilePath) {
        this.root = new Node("root", false);
        this.trie_from_txt(sDictionaryFilePath);
    }

    add_word(word) {
        let currNode = this.root;

        for (let letter of word.slice(0, -1)) {
            let not_found = true;
            if (letter in currNode.children) {
                currNode = currNode.children[letter];
                not_found = false;
            }
            
            if (not_found) {
                let newNode = new Node(letter, false);
                currNode.children[letter] = newNode;
                currNode = newNode;
            }
        }

        let not_found = true;
        let letter = word[word.length - 1];
        if (letter in currNode.children) {
            currNode.children[letter].terminate = true;
            not_found = false;
        }

        if (not_found) {
            currNode.children[letter] = new Node(letter, true);
        }
    }

    trie_from_txt(filename) {
        let oHttpRequest = new XMLHttpRequest();
        let sFileContent = '';
        const self = this;
        oHttpRequest.open("GET", filename, true);
        oHttpRequest.send();
        oHttpRequest.onreadystatechange = function () {
            if (oHttpRequest.readyState === 4 && oHttpRequest.status === 200) {
                sFileContent = oHttpRequest.responseText;
                const aWords = sFileContent.split(/\r?\n/);
                for (let sWord of aWords) {
                    self.add_word(sWord);
                }
            }
        }
    }

    update_down_check(prefix, suffix, tile) {
        // Use the prefix to iterate through the trie
        let curr_node = this.root;
        for (let letter of prefix) {
            curr_node = curr_node.children[letter];
        }

        // Check all possible letters to see if they can make valid down checks
        for (let letter of ScrabbleTools.getAlphabet()) {
            // Remove if the letter is not a child of the current node
            if (!(letter in curr_node.children)) {
                if (tile.verticalAvailableLetters.includes(letter)) {
                    tile.verticalAvailableLetters.splice(tile.verticalAvailableLetters.indexOf(letter), 1);
                }
                continue;
            }
            // Remove if that letter does not form a valid word
            if (!this.valid_word(suffix, curr_node.children[letter])) {
                if (letter in tile.verticalAvailableLetters) {
                    tile.verticalAvailableLetters.splice(tile.verticalAvailableLetters.indexOf(letter), 1);
                }
            }
        }
    }

    update_across_check(prefix, suffix, tile) {
        // Use the prefix to iterate through the trie
        let curr_node = this.root;
        for (let letter of prefix) {
            curr_node = curr_node.children[letter];
        }

        // Check all possible letters to see if they can make valid across checks
        for (let letter of ScrabbleTools.getAlphabet()) {
            // Remove if the letter is not a child of the current node
            if (!(letter in curr_node.children)) {
                if (letter in tile.horizontalAvailableLetters) {
                    tile.horizontalAvailableLetters.splice(tile.horizontalAvailableLetters.indexOf(letter), 1);
                }
                continue;
            }
            // Remove if that letter does not form a valid word
            if (!this.valid_word(suffix, curr_node.children[letter])) {
                if (letter in tile.horizontalAvailableLetters) {
                    tile.horizontalAvailableLetters.splice(tile.horizontalAvailableLetters.indexOf(letter), 1);
                }
            }
        }
    }

    valid_word(word, root = null) {
        let curr_node = root ? root : this.root;

        // Travers the trie tree to the last letter if there is a path
        for (let letter of word.slice(0, -1)) {

            // not_found is true if the current node does not have a child node with
            // the specified letter
            let not_found = true;

            if (letter in curr_node.children) {
                curr_node = curr_node.children[letter];
                not_found = false;
            }

            if (not_found) {
                return false
            }
        }

        // If no word is being valid just ensure the starting node is terminated
        if (word.length === 0) {
            return curr_node.terminate;
        }

        // Check that the last node has terminate
        let letter = word[word.length - 1];
        // for child in curr_node.children:
        return (letter in curr_node.children && curr_node.children[letter].terminate);
    }
}