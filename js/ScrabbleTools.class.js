import {ScrabbleRack} from "./ScrabbleRack.class.js";
import {ScrabbleBoard} from "./ScrabbleBoard.class.js";

export class ScrabbleTools {
    /**
     * Search the score value of the given letter
     * @param {string} sLetter
     * @returns {number}
     */
    static getScoreByLetter(sLetter) {
        const aScores = {
            0: '?',
            1: 'a,e,i,l,n,o,r,s,t,u',
            2: 'd,g',
            3: 'b,c,m,p',
            4: 'f,h,v,w,y',
            5: 'k',
            8: 'j,x',
            10: 'q,z'
        };

        if (sLetter.length !== 1) {
            return 0;
        }
        for (let iScore in aScores) {
            if (aScores[iScore].indexOf(sLetter.toLowerCase()) >= 0) {
                return parseInt(iScore);
            }
        }
        return 0;
    }

    static getAlphabet() {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
            'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    }

    static saveDataInLocalStorage() {
        ScrabbleBoard.saveBoardInLocalStorage();
        ScrabbleRack.saveRackInLocalStorage();
    }

}
