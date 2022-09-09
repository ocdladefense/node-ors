import { OrsParser } from "./ors-parser.js";
export { OrsChapter };


class OrsChapter {

    //Class variables
    section;
    document;
    sectionTitles = {};
    sectionHeadings = {};
    volumeNames = {};
    static cache = {};
    loaded;
    loadedXml;
    xml;


    constructor(chapter) {
        this.chapter = chapter;
        this.constructor.cache[chapter] = this;
    }

    //Gets the chapter from the cache
    static getCached(chapter) {
        return this.cache[chapter];
    }

    //Fetches the contents of the original chapter page on the official ORS site
    //Transforms it in to a well-formed HTML document
    async load() {
        if (this.loaded) { return Promise.resolve(true); }

        return fetch("index.php?chapter=" + this.chapter)
            .then(function (resp) {
                return resp.arrayBuffer();
            })
            .then(function (buffer) {
                const decoder = new TextDecoder("iso-8859-1");
                return decoder.decode(buffer);
            })
            .then((html) => {
                //initialize the parser
                const parser = new DOMParser();
                html = OrsParser.replaceAll(html);
                //tell the parser to look for html
                this.doc = parser.parseFromString(html, "text/html");

                //createa nodeList of all the <b> elements in the body
                let headings = this.doc.querySelectorAll("b");

                for (var i = 0; i < headings.length; i++) {
                    let boldParent = headings[i];
                    var trimmed = headings[i].textContent.trim();
                    if (trimmed.indexOf("Note") === 0) continue;
                    let strings = trimmed.split("\n");
                    let chapter, section, key, val;

                    // if array has only one element,
                    // then we know this doesn't follow the traditional statute pattern.
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

                    //might need to change this one to remove parseInt
                    this.sectionTitles[parseInt(section)] = val;
                    this.sectionHeadings[parseInt(section)] = boldParent;
                }

                this.loaded = true;
                this.injectAnchors();
            });
    }

    //Outputs the document as an HTML string
    toString() {
        const serializer = new XMLSerializer();
        const subset = this.doc.querySelector(".WordSection1");
        return serializer.serializeToString(subset);
    }

    //Inserts anchors as div tags in the doc.
    injectAnchors() {        
        for (var prop in this.sectionTitles) {
            var headingDiv = this.doc.createElement('div');
            headingDiv.setAttribute('id', prop);
            headingDiv.setAttribute('class', 'ocdla-heading');
            headingDiv.setAttribute('data-chapter', this.chapter);
            headingDiv.setAttribute('data-section', prop);

            let target = this.sectionHeadings[prop];
            target.parentNode.insertBefore(headingDiv, target);
        }
    }

    //Creates the scrollable table of contents on the big modal
    buildToc() {
        let toc = [];

        for (let key in this.sectionTitles) {
            let val = this.sectionTitles[key];
            toc.push(`<li><a href="#${key}">${key} - ${val}</a></li>`);
        }

        var joinedToc = toc.join(' ');
        return joinedToc;
    }

    //Creates the list of volumes in the dropdown selector on the big modal
    buildVolumes() {
        //Need to replace this array with a dynamically generated list
        let volumes = ["Courts, Or. Rules of Civil Procedure",
            "Business Organizations, Commercial Code",
            "Landlord-Tenant, Domestic Relations, Probate",
            "Criminal Procedure, Crimes",
            "State Government, Government Procedures, Land Use",
            "Local Government, Pub. Employees, Elections",
            "Pub. Facilities & Finance",
            "Revenue & Taxation",
            "Education & Culture",
            "Highways, Military",
            "Juvenile Code, Human Services",
            "Pub. Health",
            "Housing, Environment",
            "Drugs & Alcohol, Fire Protection, Natural Resources",
            "Water Resources, Agriculture & Food",
            "Trade Practices, Labor & Employment",
            "Occupations",
            "Financial Institutions, Insurance",
            "Utilities, Vehicle Code, Watercraft, Aviation, Constitutions"];

        let options = volumes.map(function (v, index) { return `<option id="${index + 1}" value="${index + 1}">Volume ${index + 1} - ${v}</option>` });
        this.volumeNames = options;
        let optionsHtml = options.join("\n");

        return `<select id='dropdown'>` + optionsHtml + `</select>`;
    }

    //Highlights a selected section on the page
    highlight(section, endSection) {
        console.log(this.chapter);
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

    //Clones the contents inside a range
    clone(sectionNumber, endSection) {
        let range = this.doc.createRange();

        var firstNode = this.doc.getElementById(sectionNumber);
        console.log(firstNode);
        var secondNode = this.doc.getElementById(endSection);
        console.log(secondNode);
        range.setStartBefore(firstNode);
        range.setEndBefore(secondNode);

        console.log(range);

        var contents = range.cloneContents();
        console.log(contents);

        return contents;
    }


    //Returns the next section in the document for use in building ranges
    getNextSection(sectionNum) {
        var headings = this.doc.querySelectorAll('.ocdla-heading');
        var section = this.doc.getElementById(sectionNum);

        for (let i = 0; i < headings.length; i++) {
            if (headings.item(i) == section) {
                let nextSection = headings.item(i + 1);
                return nextSection;
            }
        }

    }

    //Loads the XML file containing the names of all Volumes, Titles, and Chapters
    async loadXml(volumeNumber) {
        if (this.loadedXml) { return Promise.resolve(true); }

        let url = "ors.xml"
        fetch(url)
            .then(response => response.text())
            .then(data => {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(data, "application/xml");
                this.xml = xmlDoc;
                console.log(xml);
                //currently we are hardcoading the volume number, this will eventually
                //be replaced by a variable linked to a change event 
                //on the volume dropdown selector in the big modal
                /*
                var volumeNumber = "1";
                console.log(volumeNumber);
                this.getChaptersByVolume(xml, volumeNumber);
                */
                this.loadXml = true;
            });
    }


    //Returns a list of chapters as links based on the selected volume
    getChaptersByVolume(volumeNumber) {
        //currently we are hardcoading the volume number, this will eventually
        //be replaced by a variable linked to a change event 
        //on the volume dropdown selector in the big modal
        var volumeNumber ="1";
        
        let chapters = this.xml.querySelectorAll("#vol-" + volumeNumber + " chapter");
        console.log(chapters);
        let links = [];

        for (var i = 0; i < chapters.length; i++) {
            let chapter = chapters[i];
            var parts = chapter.id.split("-");
            let chapterNum = parts[1];
            let chapterName = chapter.innerText;
            let link = `<a href="#" data-action="show-ors" data-chapter="${chapterNum}" data-section="1">${chapterName}</a>`;
            links.push(link);
        }

        console.log(links);
        return links.join("\n");
    }

}