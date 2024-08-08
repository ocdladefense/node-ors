import OrsOutline from './Outline.js';

const gSubRe = /^\(([0-9a-zA-Z]+)\)(.*)/gm;
const subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;

// Fetches the contents of the original ORS chapter from the Oregon Legislature web site.
// Transforms it in to a well-formed HTML document.
export default class OrsChapter {
    // The chapter number.
    chapterNum = null;

    // Title of this chapter - must be a string.
    title;

    // The chapter's underlying XML document.
    doc = null;

    // Parsed title of each section of this chapter.
    sectionTitles = {};

    // Contains references to DOM node <b> elements.
    // Might be unused.
    sectionHeadings = {};

    constructor(chapterNum) {
        this.chapterNum = chapterNum;
        this.doc = new Document();
    }

    // Convert one unstructured chapter into a structured chapter.
    // Use the anchors in the unstructured chapter to build a structured chapter
    // where each section and subsection(s) are grouped and wrapped in the appropriate node hierarchy.
    static toStructuredChapter(chapter) {
        let ch = new OrsChapter(chapter.chapterNum);
        let doc = ch.doc;
        ch.chapterTitle = chapter.chapterTitle;
        ch.sectionTitles = chapter.sectionTitles;

        let wordSection = doc.createElement('div');
        wordSection.setAttribute('class', 'WordSection1');

        for (var prop in chapter.sectionTitles) {
            // Create a new section element.
            const section = doc.createElement('div');
            section.setAttribute('id', 'section-' + prop);

            // console.log(prop);
            let startId = 'section-' + parseInt(prop);
            let endId = chapter.getNextSectionId(startId);
            let clonedSection = chapter.cloneFromIds(startId, endId);
            let [header, matches] = chapter.retrievePTags(clonedSection);

            // If matches are returned as just a string which means no subsections exist for that section then you just build the element with the text that is stored in matches and append it to the section
            if (typeof matches == 'string') {
                let element = OrsOutline.buildSection(
                    doc,
                    'description',
                    'section-' + prop + '-description',
                    matches,
                    0
                );
                section.appendChild(element);
            } else {
                chapter.iterateMatches(matches, 0, section, prop);
            }
            wordSection.appendChild(section);
        }
        doc.appendChild(wordSection);

        return ch;
    }

    static fromResponse(resp, chapterNum) {
        return resp
            .arrayBuffer()
            .then(function (buffer) {
                const decoder = new TextDecoder('iso-8859-1');
                return decoder.decode(buffer);
            })
            .then(html => {
                const parser = new DOMParser();

                let chapter = new OrsChapter(chapterNum);
                // Tell the parser to look for html
                chapter.doc = parser.parseFromString(html, 'text/html');

                let [sectionTitles, sectionHeadings] =
                    OrsOutline.retrieveSectionTitles(chapter.doc);
                chapter.sectionTitles = sectionTitles;
                chapter.sectionHeadings = sectionHeadings;
                chapter.injectAnchors();

                return chapter;
            });
    }

    // Inserts anchors as <div> tags in the doc.
    // Note: this affects the underlying structure
    //  of the XML document.
    injectAnchors() {
        for (var prop in this.sectionTitles) {
            let headingDiv = this.doc.createElement('div');
            headingDiv.setAttribute('id', 'section-' + prop);
            headingDiv.setAttribute('class', 'ocdla-heading');
            headingDiv.setAttribute('data-chapter', this.chapterNum);
            headingDiv.setAttribute('data-section', prop);

            let target = this.sectionHeadings[prop];
            target.parentNode.insertBefore(headingDiv, target);
        }
        var subset = this.doc.querySelector('.WordSection1');
        let headingDiv = this.doc.createElement('div');
        headingDiv.setAttribute('class', 'ocdla-heading');
        headingDiv.setAttribute('id', 'end');
        subset.appendChild(headingDiv);
    }

    /**
     *
     * @param {String} id
     * @returns DOMNode
     */
    getSection(id) {
        return this.doc.getElementById('section-' + id);
    }

    /**
     *
     * @param {String} id
     * @returns DOMNode
     */
    querySelectorAll(references) {
        let nodes = [];
        console.log('references length is: ', references);
        for (let i = 0; i < references.length; i++) {
            let reference = references[i];
            let chapter, section, subsection;
            let rangeStart, rangeEnd;
            [rangeStart, rangeEnd] = reference.split('-');
            console.log('Ranges', rangeStart, rangeEnd);
            [chapter, section, subsection] =
                OrsChapter.parseReference(rangeStart);
            console.log(chapter, section, subsection);
            let ids = subsection
                ? [parseInt(section), subsection].join('-')
                : parseInt(section);
            ids = '#section-' + ids;
            // console.log(ids);
            let node = this.doc.querySelector(ids);
            if (null == node) return null;

            // If the selector specifies a range of subsections retrieve only those.
            if (rangeEnd) {
                console.log('RANGE DETECTED!');
                node = node.parentNode.cloneNode(true);
                node = OrsChapter.extractRange(node, rangeStart, rangeEnd);
            }

            nodes.push(node);
            // console.log(nodes);
        }
        return nodes;
    }

    static extractRange(node, startRef, endRef) {
        // console.log(node, startRef, endRef);
        // check node.children
        // match (1)(a)(A)(i) etc.

        let start = OrsChapter.parseSubsections(startRef);
        let end = OrsChapter.parseSubsections(endRef);
        let remove = [];
        let regEx, regStart, regEnd;

        regStart = start.pop();
        regEnd = end.pop();
        regEx = new RegExp('[' + regStart + '-' + regEnd + ']');

        let children = node.children;
        for (var i = 0; i < children.length; i++) {
            let child = children[i];
            let id = child.getAttribute('id');
            if (!id) continue;
            let parts = id.split('-');
            let compare = parts.pop();
            console.log('Comparing ', compare, regEx);
            if (!compare.match(regEx)) {
                console.log('match not found');
                remove.push(child);
            } else {
                console.log('match found');
            }
        }

        for (var n of remove) {
            node.removeChild(n);
        }

        return node;
    }

    static parseSubsections(reference) {
        let subs = reference.match(/(?<=\()([0-9a-zA-Z]+)(?=\))/g);

        console.log('parseSubsections()', subs);

        return subs;
    }

    static parseReference(reference) {
        let chapter, section, subsection;
        let parts = reference.match(/([0-9a-zA-Z]+)/g);
        chapter = parts.shift();
        section = parts.shift();

        // Parse a range of subsections.
        // Parse a comma-delimitted series of subsections.
        //this.references = reference.split(",");
        subsection = parts.length > 0 ? parts.join('-') : null;
        return [chapter, section, subsection];
    }

    // there are exceptions!!!
    // such as (5)(a).
    // it will find the 5, and put subsection level to 0.
    // HOWEVER, we are actually supposed to be on (a).
    // the level is supposed to be 1.
    // the next subsection in the list is (A).
    // this is ONLY EXPECTED when level is 1. Not when level is 0.
    // so it breaks. Hurray!

    retrievePTags(section) {
        let text = '';
        let pTags = section.children;

        let fn = function (match, p1, offset, original) {
            let duo = match.split(')(');
            return duo.join(')\n(');
        };

        let header = pTags[0].querySelector('b');
        header = pTags[0].removeChild(header);
        header = header.innerText;

        for (var index in pTags) {
            let child = pTags[index];
            let childText = '';

            if (child != null) {
                childText = child.innerText;
            }

            if (childText == null || childText == '') {
                continue;
            }

            childText = childText.trim().replaceAll('\n', ' ');
            text += childText + '\n';
        }

        let matches = text.replaceAll(
            /(^\([0-9a-zA-Z]+\)\([0-9a-zA-Z]+\))/gm,
            fn
        );

        matches = matches.match(gSubRe);

        return matches === null ? [header, text] : [header, matches];
    }

    iterateMatches(
        matches,
        currentIndex,
        parent,
        sectionNumber,
        lastLevel = '0'
    ) {
        //if we leave off at a roman numeral then

        //console.log(matches);
        // console.log(sectionNumber);
        if (sectionNumber == 555) {
            // console.log(matches);
        }
        if (currentIndex >= matches.length) {
            return parent;
        }

        //for (var i = currentIndex; i < matches.length; i++) {
        // let match = fun(matches, currentIndex);
        let match = matches[currentIndex].match(subRe);
        let nextMatch = matches[currentIndex + 1];
        let id, divId, text, level;
        if (match == null) {
            // not a subsection
            // what do?
            // nothing. we shouldn't handle this case, this is either descriptive text or not..?
            // maybe handle for single section text like 701.002.
            id = 'description';
            text = matches[currentIndex];
            level = '0';
            return;
        } else {
            id = match[1];
            text = '(' + id + ')' + match[2];
            level = OrsOutline.findLevel(id, nextMatch);
        }

        //console.log(match);
        // 0 should be full text?
        // 1 is id
        // 2 is text without subsection

        if (level > lastLevel) {
            parent = parent.lastChild;
        } else if (level < lastLevel) {
            if (lastLevel - level == 1) {
                parent = parent.parentNode;
            } else if (lastLevel - level == 2) {
                parent = parent.parentNode.parentNode;
            } else if (lastLevel - level == 3) {
                parent = parent.parentNode.parentNode.parentNode;
            }
        }
        if (parent == null) {
            console.warn('Parent is null', matches, sectionNumber);
            return;
        }
        divId = parent.getAttribute('id') + '-' + id;
        let element = OrsOutline.buildSection(this.doc, id, divId, text, level);
        parent.appendChild(element);
        // identify subsections
        // build subsection grouping elements

        this.iterateMatches(
            matches,
            ++currentIndex,
            parent,
            sectionNumber,
            level
        );
    }

    removeNodes(selector) {
        let nodes = this.doc.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.parentNode.removeChild(node);
        }
    }

    buildToc() {
        let toc = [];

        for (let key in this.sectionTitles) {
            let val = this.sectionTitles[key];
            toc.push(
                `<li><span class="section-number">${this.chapterNum}.${key}</span><a data-action="view-section" data-section="${key}" href="#">${val}</a></li>`
            );
        }

        var joinedToc = toc.join(' ');
        return joinedToc;
    }

    // Highlights a selected section on the page
    highlight(section, endSection) {
        console.log(this.chapterNum);
        console.log(section);
        console.log(endSection);
        let range = this.doc.createRange();

        var firstNode = this.doc.getElementById(section);
        console.log(firstNode);
        var secondNode = this.doc.getElementById(endSection);
        console.log(secondNode);
        range.setStartBefore(firstNode);
        range.setEnd(
            secondNode.parentNode,
            secondNode.parentNode.childNodes.length
        );

        console.log(range);

        var newParent = this.doc.createElement('div');
        newParent.setAttribute('style', 'background-color:yellow;');

        var contents = range.extractContents();
        console.log(contents);
    }

    cloneFromIds(startId, endId) {
        var startNode = this.doc.getElementById(startId);
        if (null == startNode) {
            throw new Error('NODE_NOT_FOUND_ERROR: (#' + startId + ')');
        }
        var endNode = this.doc.getElementById(endId);
        if (null == startNode) {
            throw new Error('NODE_NOT_FOUND_ERROR: (#' + endId + ')');
        }

        return this.clone(startNode, endNode);
    }

    // Clones the contents inside a range.
    clone(startNode, endNode) {
        let range = document.createRange();

        range.setStartBefore(startNode);
        range.setEndBefore(endNode);

        var contents = range.cloneContents();

        var spans = contents.querySelectorAll('span');
        // remove styling from each span
        for (var elements in spans) {
            let element = spans[elements];
            if (element.style) {
                element.style = null;
            }
        }
        // console.log(contents);
        return contents;
    }

    // Given a valid section number,
    // returns the next section in this ORS chapter.
    // Used for building ranges.
    getNextSectionId(sectionNum) {
        var headings = this.doc.querySelectorAll('.ocdla-heading');
        var section = this.doc.getElementById(sectionNum);

        if (null == section) {
            throw new Error(
                'NODE_NOT_FOUND_ERROR: Could not locate ' + sectionNum
            );
        }
        for (let i = 0; i < headings.length; i++) {
            if (headings.item(i) == section) {
                let nextSection = headings.item(i + 1);
                return nextSection.getAttribute('id');
            }
        }
    }

    // Outputs the document as an HTML string
    toString() {
        const serializer = new XMLSerializer();
        const subset = this.doc.querySelector('.WordSection1');

        return serializer.serializeToString(subset);
    }
}
