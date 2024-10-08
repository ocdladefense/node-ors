import OrsNode from "./OrsNode.js";
import OrsSectionNode from "./OrsSectionNode.js";
import OrsNodeTypes from "./OrsNodeTypes.js";

export default class OrsDocumentNode extends OrsNode {
  #nodeType = OrsNodeTypes.ORS_CHAPTER_NODE;

  #nodeName = "#orschapter";

  constructor(doc) {
    doc = doc || new Document();
    super(doc, null);
  }



  createOrsSection(sectionNumber) {

    let section = new OrsSectionNode(this.getElementById("section-" + sectionNumber, this));
    section.setSectionNumber(sectionNumber);

    return section;
  }

  

  static fromHtml(html) {
    let parser = new DOMParser();
    let _doc = parser.parseFromString(html, "text/html");
    let doc = new OrsDocumentNode(_doc);

    // The main section of an ORS chapter is contained in a div with the class "WordChapter1".
    let content = doc.querySelector(".WordSection1");
    let endOfSectionsMarker = doc.createElement("div");
    endOfSectionsMarker.setAttribute("class", "ors-end-of-chapter");
    content.appendChild(endOfSectionsMarker);

    return doc;
  }



  map(selector, callback) {
    let nodes = this.querySelectorAll(selector);

    return nodes.map(callback);
  }


  getElementById(id) {
    return this.node.getElementById(id);
  }
  // Given a valid section number,
  // returns the next section in this ORS chapter.
  // Used for building ranges.
  getNextSectionId(sectionNum) {
    var section = this.getElementById(sectionNum);

    return section.nextElementSibling;
  }

  /**
   *
   * @param {String} id
   * @returns DOMNode
   */
  getSection(id) {
    return this.createOrsSection(id);
  }

  getContentNode() {
    return this.node.querySelector(".WordSection1");
  }

  getSections(references) {
    references = Array.isArray(references) ? references : [references];
    references = references.map((ref) => Parser.parseReference(ref));

    let selectors = references.map((ref) => "#section-" + this.sectionNumber);

    // Currently there is an issue because our source document has all kinds of nasty <html> tags in it.
    return [this.doc.querySelector(selectors[0])];
  }

  createSectionAnchor(sectionNumber) {
    let anchor = this.createElement("div");
    anchor.setAttribute("class", "ors-anchor");
    // anchor.setAttribute("data-chapter", 1);
    anchor.setAttribute("data-section", sectionNumber);

    return anchor;
  }

  wrapSections(selector) {
    let sections = this.node.querySelectorAll(
      selector
    );

    for (let i = 0; i < sections.length - 1; i++) {
      let start = sections[i];
      let end = sections[i + 1];
      let oHeading, nHeading;
      let id = "section-" + start.getAttribute("data-section");
      let range = this.getRangeBetweenSections(start, end);
      let container = this.createElement("div");
      container.setAttribute("id", id);
      
      range.surroundContents(container);

      oHeading = container.querySelector("b");
      console.log(oHeading);
      if(null == oHeading) {
        console.warn("Unable to find heading for section: ", sections[i], container);
        continue;
      }
      nHeading = this.createElement("h2");
      nHeading.appendChild(this.createTextNode(oHeading.innerText));

      let nContainer = this.node.querySelector("#"+id);
      console.log(nContainer);
      nContainer.prepend(nHeading);

      oHeading.parentNode.removeChild(oHeading);
    }
  }

  createElement(tagName) {
    return this.node.createElement(tagName);
  }

  createTextNode(text) {

    return this.node.createTextNode(text);
  }

  /**
   *
   * @param {String} id
   * @returns DOMNode
   */
  queryReferenceAll(references) {
    return [];
  }
  queryReference(references) {
    let nodes = [];

    if (!Array.isArray(references)) {
      console.log("References is not an array");
      return this.doc.querySelector(references);
    }
    console.log("References length is: ", references);
    for (let i = 0; i < references.length; i++) {
      let reference = references[i];
      let chapter, section, subsection;
      let rangeStart, rangeEnd;
      [rangeStart, rangeEnd] = reference.split("-");
      console.log("Ranges", rangeStart, rangeEnd);
      [chapter, section, subsection] = Chapter.parseReference(rangeStart);
      console.log(chapter, section, subsection);
      let ids = subsection
        ? [parseInt(section), subsection].join("-")
        : parseInt(section);
      ids = "#section-" + ids;
      // console.log(ids);
      let node = this.doc.querySelector(ids);
      if (null == node) return null;

      // If the selector specifies a range of subsections retrieve only those.
      if (rangeEnd) {
        console.log("RANGE DETECTED!");
        node = node.parentNode.cloneNode(true);
        node = Chapter.extractRange(node, rangeStart, rangeEnd);
      }

      nodes.push(node);
      // console.log(nodes);
    }
    return nodes;
  }

  /**
   * Create a new DOM document using the given title and content node.
   * This method facilitates the creation of a new Document object, assuming
   * that the user has already extracted a content node from another document.
   *
   * @TODO move to new DomDocument class.
   */
  static newDomDocument(title, contentNode) {
    let doc = new Document();
    let root = doc.createElement("html");
    let _title = doc.createElement("title");
    _title.append(title);
    let head = doc.createElement("head");
    head.appendChild(_title);
    let body = doc.createElement("body");
    doc.appendChild(root);
    root.appendChild(head);
    root.appendChild(body);
    let content = doc.importNode(contentNode, true);
    let endOfSectionsMarker = document.createElement("div");
    endOfSectionsMarker.setAttribute("class", "ors-end-of-chapter");
    content.appendChild(endOfSectionsMarker);
    body.appendChild(content);

    return doc;
  }

  createDocumentFragment(html) {
    const parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");

    let fragment = this.node.createDocumentFragment();
    fragment.append(doc.documentElement);

    return fragment;
  }



  // Used after the anchor phase to wrap the topmost chapter sections with a div.
  getRangeBetweenSections(node1, node2, inclusive = false) {
    let range = this.node.createRange();
    
    if(inclusive) {
      range.setStartBefore(node1);
      range.setEndAfter(node2);
    } else {
      range.setStartAfter(node1);
      range.setEndBefore(node2);
    }
    
    return range;
  }
}
