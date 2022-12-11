export class Node {
    constructor(sLetter, bTerminate) {
        this.letter = sLetter
        this.terminate = bTerminate
        this.children = {}
    }
}
