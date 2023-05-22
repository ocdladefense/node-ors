export { OrsChapter };


class OrsChapter {

    // Class variables
    chapterNum = null;

    // The chapter's underlying XML document.
    doc = null;

    // What is the difference between these two variables.
    sectionTitles = {};

    sectionHeadings = {};
    
    // Boolean indicating if the chapter's XML document has been loaded.
    loaded = false;

    // Boolean indicating if the chapter's XML document has been modified.
    injected = false;


    constructor(chapterNum) {
        this.chapterNum = chapterNum;
    }


    // Outputs the document as an HTML string
    toString() {
        const serializer = new XMLSerializer();
        const subset = this.doc.querySelector(".WordSection1");
        return serializer.serializeToString(subset);
    }


    // Fetches the contents of the original ORS chapter from the Oregon Legislature web site.
    // Transforms it in to a well-formed HTML document.
    async load() {
        if (this.loaded) { return Promise.resolve(this.doc); }

        return fetch("index.php?chapter=" + this.chapterNum)
        .then(function (resp) {
            return resp.arrayBuffer();
        })
        .then(function (buffer) {
            const decoder = new TextDecoder("iso-8859-1");
            return decoder.decode(buffer);
        })
        .then((html) => {
            
            const parser = new DOMParser();

            // Tell the parser to look for html
            this.doc = parser.parseFromString(html, "text/html");
            this.loaded = true;
            return this.doc;
        });
    }



    parse() {

        // Createa nodeList of all the <b> elements in the body
        let headings = this.doc.querySelectorAll("b");

        for (var i = 0; i < headings.length; i++) {
            let boldParent = headings[i];
            var trimmed = headings[i].textContent.trim();
            if (trimmed.indexOf("Note") === 0) continue;
            let strings = trimmed.split("\n");
            let chapter, section, key, val;

            // If array has only one element,
            // Then we know this doesn't follow the traditional statute pattern.
            if (strings.length === 1) {
                key = strings[0];
                val = boldParent.nextSibling ? boldParent.nextSibling.textContent : "";

            } else { // otherwise our normal case.
                key = strings[0];
                val = strings[1];

                let numbers = key.split('.');
                chapter = numbers[0];
                section = numbers[1];
            }

            // Might need to change this one to remove parseInt
            this.sectionTitles[parseInt(section)] = val;
            this.sectionHeadings[parseInt(section)] = boldParent;
        }
    }



    // Inserts anchors as div tags in the doc.
    // Note: this affects the underlying structure 
    //  of the XML document.
    injectAnchors() {        
        for (var prop in this.sectionTitles) {
            var headingDiv = this.doc.createElement('div');
            headingDiv.setAttribute('id', prop);
            headingDiv.setAttribute('class', 'ocdla-heading');
            headingDiv.setAttribute('data-chapter', this.chapterNum);
            headingDiv.setAttribute('data-section', prop);

            let target = this.sectionHeadings[prop];
            target.parentNode.insertBefore(headingDiv, target);
        }

        this.formatted = true;
    }


    buildToc() {
        let toc = [];

        for (let key in this.sectionTitles) {
            let val = this.sectionTitles[key];
            toc.push(`<li><span class="section-number">${this.chapterNum}.${key}</span><a href="#${key}">${val}</a></li>`);
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
        range.setEnd(secondNode.parentNode, secondNode.parentNode.childNodes.length);

        console.log(range);

        var newParent = this.doc.createElement('div');
        newParent.setAttribute('style', 'background-color:yellow;');

        var contents = range.extractContents();
        console.log(contents);
    }

    cloneFromIds(startId, endId) {

        var startNode = this.doc.getElementById(startId);
        console.log(startNode);
        var endNode = this.doc.getElementById(endId);
        console.log(endNode);

        return this.clone(startNode, endNode);
    }


    // Clones the contents inside a range.
    clone(startNode, endNode) {

        let range = document.createRange();

        range.setStartBefore(startNode);
        range.setEndBefore(endNode);

        console.log(range);

        var contents = range.cloneContents();
        console.log(contents);

        return contents;
    }


    // Given a valid section number, 
    // returns the next section in this ORS chapter.
    // Used for building ranges.
    getNextSection(sectionNum) {
        var headings = this.doc.querySelectorAll(".ocdla-heading");
        var section = this.doc.getElementById(sectionNum);

        for (let i = 0; i < headings.length; i++) {
            if (headings.item(i) == section) {
                let nextSection = headings.item(i + 1);
                return nextSection.getAttribute("id");
            }
        }

    }

    

}