/**
 * @class Outline
 * @description This class is used to create an outline of the ORS chapter.
 */

export default class Outline {


    static findLevel(text, nextMatch) {
        let subNumRe = /^[0-9]+/;
        let subUpperRe = /^[A-Z]+/;
        let subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;

        let nextId;

        if (nextMatch != null) {
            nextId = nextMatch.match(subRe)[1];
        }

        if (text.match(subNumRe)) {
            return '0';
        } else if (
            !Outline.isRomanNumeral(text, nextId) &&
            !text.match(subUpperRe)
        ) {
            return '1';
        } else if (text.match(subUpperRe)) {
            return '2';
        } else if (Outline.isRomanNumeral(text, nextId)) {
            return '3';
        }
    }

    static isRomanNumeral(text, nextText) {
        let romanReg = /^[ivx]+/;
        if (nextText == null) {
            return text.match(romanReg);
        }
        return (
            text.match(romanReg) &&
            (nextText.match(romanReg) || text.length > 1)
        );
    }


}
