export { OrsChapter };
const gSubRe = /^\(([0-9a-zA-Z]+)\)(.*)/gm;
const subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;
class OrsChapter {
  // Class variables
  chapterNum = null;

  // The chapter's underlying XML document.
  doc = null;
  docTwo = null;

  // What is the difference between these two variables.
  sectionTitles = {};
  sectionHeadings = {};

  // Boolean indicating if the chapter's XML document has been loaded.
  loaded = false;

  // Boolean indicating if the chapter's XML document has been modified.
  injected = false;
  doneBuilding = false;
  constructor(chapterNum) {
    this.chapterNum = chapterNum;
  }

  // Outputs the document as an HTML string
  toString() {
    const serializer = new XMLSerializer();
    const subset = this.doc.querySelector(".WordSection1");
    return serializer.serializeToString(subset);
  }
  init() {
    //this regex will be used to split and make the looking for array /([0-9a-zA-Z]+)/g
    //const wordDoc = this.doc.getElementsByClassName("WordSection1")[0].innerText;
    this.docTwo = new Document();
    let wordSection = this.docTwo.createElement("div");
    wordSection.setAttribute("class", "WordSection1");
    for (var prop in this.sectionTitles) {
      // console.log(prop);
      let startId = "section-" + parseInt(prop);
      let endId = this.getNextSectionId(startId);
      let header, matches;
      let clonedSection = this.cloneFromIds(startId, endId);
      [header, matches] = this.retrievePTags(clonedSection);
      const section = this.docTwo.createElement("div");
      section.setAttribute("id", "section-" + prop);
      //if matches are returned as just a string which means no subsections exist for that section then you just build the element with the text that is stored in matches and append it to the section
      if (typeof matches == "string") {
        console.log("hi!");
        let element = this.buildElement("description", "section-" + prop + "-description", matches, 0);
        section.appendChild(element);
      } else {
        this.iterateMatches(matches, 0, section, prop);
      }
      wordSection.appendChild(section);
    }
    this.docTwo.appendChild(wordSection);
    console.log(this.docTwo);
  }
  getSection(id) {
    //parse the id get section number
    return this.docTwo.getElementById("section-" + id);
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
    let text = "";
    let pTags = section.children;
    //let header = "";

    let fn = function (match, p1, offset, original) {
      let duo = match.split(')(');
      return duo.join(")\n(");
    };
    let header = pTags[0].querySelector('b');
    header = pTags[0].removeChild(header);
    header = header.innerText;
    for (var index in pTags) {
      let child = pTags[index];
      let childText = "";
      if (child != null) {
        childText = child.innerText;
      }
      if (childText == null || childText == "") {
        continue;
      }
      childText = childText.trim().replaceAll('\n', ' ');
      text += childText + '\n';
    }

    //may need to actually retrieve the p tags and process each p tag with the regex
    //let matches = text.match(gSubRe);
    //let matches = text.replaceAll(/(^\([1-9a-zA-Z]+\)|(?<=\))\([1-9a-zA-Z]+\))/gm, fn);
    let matches = text.replaceAll(/(^\([0-9a-zA-Z]+\)\([0-9a-zA-Z]+\))/gm, fn);
    /*
    let matches = text.replaceAll(splitSubRe, fn);
    while (matches.match(splitSubRe)) {
        matches = matches.replaceAll(splitSubRe, fn);
    }*/
    matches = matches.match(gSubRe);

    //matches = matches.match(gSubRe);
    //matches = matches.split("\n");
    //console.log(matches, typeof (matches));
    //if there are no matches that means there arent any subsections so it just returns the text that was gotten 

    return matches == null ? [header, text] : [header, matches];
  }
  iterateMatches(matches, currentIndex, parent, sectionNumber, lastLevel = '0') {
    //if we leave off at a roman numeral then 

    //console.log(matches);

    if (currentIndex >= matches.length) {
      return parent;
    }

    //for (var i = currentIndex; i < matches.length; i++) {
    // let match = fun(matches, currentIndex);
    let match = matches[currentIndex].match(subRe);
    let nextMatch = matches[currentIndex + 1];
    let id, divId, text, level;
    console.log(matches[currentIndex]);
    if (match == null) {
      // not a subsection
      // what do?
      // nothing. we shouldn't handle this case, this is either descriptive text or not..?
      // maybe handle for single section text like 701.002.
      id = "description";
      text = matches[currentIndex];
      level = '0';
    } else {
      id = match[1];
      text = "(" + id + ")" + match[2];
      level = this.findLevel(id, nextMatch);
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
      throw new Error("Parent is null");
    }
    divId = parent.getAttribute("id") + "-" + id;
    let element = this.buildElement(id, divId, text, level);
    parent.appendChild(element);
    // identify subsections
    // build subsection grouping elements

    this.iterateMatches(matches, ++currentIndex, parent, sectionNumber, level);

    //}
  }

  buildElement(id, divId, text, level) {
    let sub = this.docTwo.createElement("div");
    sub.setAttribute("id", divId);
    sub.setAttribute("class", "level-" + level);
    let span = this.docTwo.createElement("span");
    span.setAttribute("class", "subsection");
    if (id != 'description') {
      span.innerText = '(' + id + ')';
    }
    let theText = this.docTwo.createTextNode(text);
    sub.appendChild(span);
    sub.appendChild(theText);
    return sub;
  }
  findLevel(text, nextMatch) {
    let subNumRe = /^[0-9]+/;
    let subUpperRe = /^[A-Z]+/;
    let subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;
    let nextId;
    if (nextMatch != null) {
      nextId = nextMatch.match(subRe)[1];
    }
    if (text.match(subNumRe)) {
      return '0';
    } else if (!this.isRomanNumeral(text, nextId) && !text.match(subUpperRe)) {
      return '1';
    } else if (text.match(subUpperRe)) {
      return '2';
    } else if (this.isRomanNumeral(text, nextId)) {
      return '3';
    }
  }
  isRomanNumeral(text, nextText) {
    let romanReg = /^[ivx]+/;
    if (nextText == null) {
      return text.match(romanReg);
    }
    return text.match(romanReg) && (nextText.match(romanReg) || text.length > 1);
  }

  // Fetches the contents of the original ORS chapter from the Oregon Legislature web site.
  // Transforms it in to a well-formed HTML document.
  async load(resp) {
    if (this.loaded) {
      return Promise.resolve(this.doc);
    }
    return resp.arrayBuffer().then(function (buffer) {
      const decoder = new TextDecoder("iso-8859-1");
      return decoder.decode(buffer);
    }).then(html => {
      const parser = new DOMParser();

      // Tell the parser to look for html
      this.doc = parser.parseFromString(html, "text/html");
      this.loaded = true;
      if (!this.formatted) {
        this.parse();
        this.injectAnchors();
      }
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
      } else {
        // otherwise our normal case.
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
      headingDiv.setAttribute('id', "section-" + prop);
      headingDiv.setAttribute('class', 'ocdla-heading');
      headingDiv.setAttribute('data-chapter', this.chapterNum);
      headingDiv.setAttribute('data-section', prop);
      let target = this.sectionHeadings[prop];
      target.parentNode.insertBefore(headingDiv, target);
    }
    var subset = this.doc.querySelector(".WordSection1");
    var headingDiv = this.doc.createElement('div');
    headingDiv.setAttribute('class', 'ocdla-heading');
    headingDiv.setAttribute('id', "end");
    subset.appendChild(headingDiv);
    this.formatted = true;
  }
  buildToc() {
    let toc = [];
    for (let key in this.sectionTitles) {
      let val = this.sectionTitles[key];
      toc.push(`<li><span class="section-number">${this.chapterNum}.${key}</span><a data-action="view-section" data-section="${key}" href="#">${val}</a></li>`);
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
    if (null == startNode) {
      throw new Error("NODE_NOT_FOUND_ERROR: (#" + startId + ")");
    }
    var endNode = this.doc.getElementById(endId);
    if (null == startNode) {
      throw new Error("NODE_NOT_FOUND_ERROR: (#" + endId + ")");
    }
    return this.clone(startNode, endNode);
  }

  // Clones the contents inside a range.
  clone(startNode, endNode) {
    let range = document.createRange();
    range.setStartBefore(startNode);
    range.setEndBefore(endNode);
    var contents = range.cloneContents();

    // Find all span elements within range
    var spans = contents.querySelectorAll("span");

    // remove styling from each span
    for (var elements in spans) {
      let element = spans[elements];
      if (element.style) {
        element.style = null;
      }
    }
    return contents;
  }

  // Given a valid section number, 
  // returns the next section in this ORS chapter.
  // Used for building ranges.
  getNextSectionId(sectionNum) {
    var headings = this.doc.querySelectorAll(".ocdla-heading");
    var section = this.doc.getElementById(sectionNum);
    if (null == section) {
      throw new Error("NODE_NOT_FOUND_ERROR: Could not locate " + sectionNum);
    }
    for (let i = 0; i < headings.length; i++) {
      if (headings.item(i) == section) {
        let nextSection = headings.item(i + 1);
        return nextSection.getAttribute("id");
      }
    }
  }
}