import {Node} from "./Node.class.js";

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