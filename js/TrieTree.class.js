import {Node} from "./Node.class.js";

export class TrieTree {
    
    constructor(sDictionaryFilePath) {
        this.root = new Node("root", false);
        this.buildTrieFromDictionary(sDictionaryFilePath);
    }

    /**
     * Add the given word to the Trie
     * @param {string} sWord
     */
    addWord(sWord) {
        let oCurrentNode = this.root;
        // For all letter but the last
        for (let sLetter of sWord.slice(0, -1)) {
            // If child node already exist with this letter, move to it
            if (sLetter in oCurrentNode.children) {
                oCurrentNode = oCurrentNode.children[sLetter];
            } else {
                // Else, create a new node for the letter and move to it
                let oNewNode = new Node(sLetter, false);
                oCurrentNode.children[sLetter] = oNewNode;
                oCurrentNode = oNewNode;
            }
        }

        // For the last letter in given word
        let sLetter = sWord[sWord.length - 1];

        // If child node already exist with this letter, set his terminate value to true
        if (sLetter in oCurrentNode.children) {
            oCurrentNode.children[sLetter].terminate = true;
        } else {
            // Else, create a node for this letter with the terminate value to true
            oCurrentNode.children[sLetter] = new Node(sLetter, true);
        }
    }

    /**
     * Add all words from the given file to the trie
     * @param {string} sFileName
     */
    buildTrieFromDictionary(sFileName) {
        let oHttpRequest = new XMLHttpRequest();
        let sFileContent = '';
        const oSelf = this;
        // Use Http request to retrieve file from server, client side
        oHttpRequest.open("GET", sFileName, true);
        oHttpRequest.send();
        oHttpRequest.onreadystatechange = function () {
            if (oHttpRequest.readyState === 4 && oHttpRequest.status === 200) {
                sFileContent = oHttpRequest.responseText;
                // Consider each line as a word
                const aWords = sFileContent.split(/\r?\n/);
                for (let sWord of aWords) {
                    oSelf.addWord(sWord);
                }
            }
        }
    }

    /**
     * Parse the trie from the given node (or from the root of Trie if null) to check if the given word exist
     * @param {string} sWord
     * @param {Node|null} oNode
     * @returns {boolean}
     */
    isWordValid(sWord, oNode = null) {
        let oCurrentNode = oNode ? oNode : this.root;

        // If no word is being valid just ensure the starting node is terminated
        if (sWord.length === 0) {
            return oCurrentNode.terminate;
        }

        // Travers the trie for all the letters in word but the last
        for (let sLetter of sWord.slice(0, -1)) {
            if (sLetter in oCurrentNode.children) {
                oCurrentNode = oCurrentNode.children[sLetter];
            } else {
                // If there is no child for the current letter in the current node, the word does not exist
                return false;
            }
        }

        // Check that letter exists in current node children and that it as a "terminate" value to true
        let sLastLetter = sWord[sWord.length - 1];
        return (sLastLetter in oCurrentNode.children && oCurrentNode.children[sLastLetter].terminate);
    }
}