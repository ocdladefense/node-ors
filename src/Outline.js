/**
 * @class OrsOutline
 * @description This class is used to create an outline of the ORS chapter.
 */

export default class OrsOutline {
    /**
     * In an ORS chapter, the section titles are bolded.
     * This method retrieves the section titles and their corresponding section numbers.
     */
    static retrieveSectionTitles(doc) {
        // Createa nodeList of all the <b> elements in the body
        let headings = doc.querySelectorAll('b');
        let titles = [],
            elems = [];

        for (var i = 0; i < headings.length; i++) {
            let boldParent = headings[i];
            var trimmed = headings[i].textContent.trim();
            if (trimmed.indexOf('Note') === 0) continue;
            let strings = trimmed.split('\n');
            let chapter, section, key, val;

            // If array has only one element,
            // Then we know this doesn't follow the regular statute pattern.
            if (strings.length === 1) {
                key = strings[0];
                val = boldParent.nextSibling
                    ? boldParent.nextSibling.textContent
                    : '';
            } else {
                // otherwise our normal case.
                key = strings[0];
                val = strings[1];

                let numbers = key.split('.');
                chapter = numbers[0];
                section = numbers[1];
            }

            // Might need to change this one to remove parseInt
            titles[parseInt(section)] = val;
            elems[parseInt(section)] = boldParent;
        }

        return [titles, elems];
    }

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
            !OrsOutline.isRomanNumeral(text, nextId) &&
            !text.match(subUpperRe)
        ) {
            return '1';
        } else if (text.match(subUpperRe)) {
            return '2';
        } else if (OrsOutline.isRomanNumeral(text, nextId)) {
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

    static buildSection(doc, id, divId, text, level) {
        let sub = doc.createElement('div');
        sub.setAttribute('id', divId);
        sub.setAttribute('class', 'level-' + level);

        let span = doc.createElement('span');
        span.setAttribute('class', 'subsection');

        if (id !== 'description') {
            span.innerText = '(' + id + ')';
        }

        let theText = doc.createTextNode(text);

        sub.appendChild(span);
        sub.appendChild(theText);

        return sub;
    }
}
