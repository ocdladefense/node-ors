import OrsDocumentNode from './OrsDocumentNode.js';
import OrsSectionNode from './OrsSectionNode.js';
import OrsOutline from './Outline.js';
import Parser from './Parser.js';
import ChapterLoadPhases from './OrsChapterLoadPhases.js';





const gSubRe = /^\(([0-9a-zA-Z]+)\)(.*)/gm;

const subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;



// Fetches the contents of the original ORS chapter from the Oregon Legislature web site.
// Transforms it in to a well-formed HTML document.
export default class Chapter {
  // The chapter number.
  chapterNum = null;

  // Title of this chapter - must be a string.
  title;

  // The chapter's underlying XML document.
  document;

  // Parsed title of each section of this chapter.
  sectionTitles = [];

  // Contains references to DOM node <b> elements.
  // Might be unused.
  sectionHeadings = [];

  #loadPhases = {};

  constructor(chapterNum) {
    this.chapterNum = chapterNum;
    this.orsDocumentNode = new OrsDocumentNode();

    this.#loadPhases[ChapterLoadPhases.LOAD_SECTION_TITLES] =
      this.loadSectionTitles;
    this.#loadPhases[ChapterLoadPhases.LOAD_SECTION_TITLE_NODES] =
      this.loadSectionTitleNodes;
    this.#loadPhases[ChapterLoadPhases.ADD_SECTION_ANCHOR_NODES] =
      this.addSectionAnchorNodes;
    this.#loadPhases[ChapterLoadPhases.WRAP_SECTIONS] =
      this.wrapSectionsWithNodes;
    this.#loadPhases[ChapterLoadPhases.WRAP_SECTIONS_RECURSIVE] =
      this.wrapSectionsWithNodes;
  }


  setTitle(title) {
    this.title = title;
  }

  static fromResponse(resp, chapterNum) {
    return resp
      .arrayBuffer()
      .then(function (buffer) {
        const decoder = new TextDecoder("iso-8859-1");
        return decoder.decode(buffer);
      })
      .then((html) => {
        let chapter = new Chapter(chapterNum);
        chapter.setTitle("Dynamic ORS Document: Chapter " + chapterNum);
        chapter.loadHtml(html);
        chapter.phaseLoadSectionTitles();
        chapter.wrapSections();
        console.log(chapter.sectionTitles);

        return chapter;
        chapter.executeLoadPhases(
          // Locate all of the document's section titles (usually in <b> tags) and store the text in an array for future use.
          ChapterLoadPhase.LOAD_SECTION_TITLES,

          // Do the same with references to the <b> elements themselves.
          ChapterLoadPhase.LOAD_SECTION_TITLE_NODES,

          // Add anchor nodes to the document to allow for easy linking to sections.
          ChapterLoadPhase.ADD_SECTION_ANCHOR_NODES,

          // Wrap each section in a container node.
          ChapterLoadPhase.WRAP_SECTIONS_WITH_NODES

          // Do the same for subsections, and their own subsections.
          // ChapterLoadPhase.WRAP_SECTIONS_WITH_NODES_RECURSIVE
        );

        return chapter;
      });
  }



 wrapSections() {
    this.document.wrapSections(".ors-anchor, .ors-end-of-chapter");
 }

  getDocumentNode() {
    return this.document;
  }

  processWhitespace() {
    // ORS titles are stuck in <b> elements that contain unecessary leading and trailing whitespace.
    // Remove leading and trailing whitespace from all <b> elements.
    // Also remove line breaks with spaces.
    this.document.trimAll("p");
    this.document.trimAll("b");
    this.document.replaceInnerHTMLString("p", "\n", " ");
  }

  getContent() {
    return this.document.querySelector(".WordSection1");
  }

  executeLoadPhases(...phases) {
    for (let phase of phases) {
      // this.#loadPhases[phase].call(this);
    }
  }

  loadHtml(html) {
    this.document = OrsDocumentNode.fromHtml(html);
  }



  phaseLoadSectionTitles() {
    this.sectionHeadings = [...this.document.querySelectorAll("b")];
    let titles = this.sectionHeadings.map((node) =>
      node.textContent.trim()
    );
    let triplets = titles.map(foo);
    
    triplets.forEach((triplet) => {
      let [chapter,section,title] = triplet;
      this.sectionTitles[section.toString()] = title;
    });

    

    // Inserts anchors as <div> tags in the doc.
    // Note: this affects the underlying structure
    // of the XML document.
    triplets.forEach((triplet, index) => {
      let [chapter, section, title] = triplet;
      let b = this.sectionHeadings[index];
      let anchor = this.document.createSectionAnchor(section);
      b.parentNode.parentNode.insertBefore(anchor, b.parentNode);
    });

    function foo(label) {
      // Ignore some labels or at least take of them.
      // For example, some labels start with "Note" and are not part of the statutes.
      // if (label.indexOf("Note") === 0) return [99,99,"Amended"];

      // Distinguish between "138.010" and the title.
      // This helps to solve for the form: "138.010\nTitle of the statute".
      let [enumeration, title] = label.split("\n");
      let [chapter, section] = enumeration.split(".");

      // If val wasn't set then we know this doesn't follow the regular statute pattern.,
      // val = boldParent.nextSibling ? boldParent.nextSibling.textContent : "";
      return [parseInt(chapter), parseInt(section), title || "Amended"];
    }
  }






  // Convert one unstructured chapter into a structured chapter.
  // Use the anchors in the unstructured chapter to build a structured chapter
  // where each section and subsection(s) are grouped and wrapped in the appropriate node hierarchy.
  static toStructuredChapter(chapter) {
    let ch = new OregonRevisedStatutesChapter(chapter.chapterNum);
    let doc = ch.doc;

    ch.chapterTitle = chapter.chapterTitle;
    ch.sectionTitles = chapter.sectionTitles;

    let wordSection = doc.createElement("div");
    wordSection.setAttribute("class", "WordSection1");

    for (let sectionNumber in chapter.sectionTitles) {
      let sectionTitle = chapter.sectionTitles[sectionNumber];
      // Create a new section element.
      const section = doc.createElement("div");
      section.setAttribute("id", "section-" + sectionNumber);

      // console.log(prop);
      let startId = "section-" + parseInt(sectionNumber);
      let endId = chapter.getNextSectionId(startId);
      let clonedSection = chapter.cloneFromIds(startId, endId);
      let [header, matches] = chapter.retrievePTags(clonedSection);

      // If matches is a string, there are no subsections,
      // so we just build the element with the text that is stored in matches and append it to the section
      if (typeof matches == "string") {
        // console.log(matches);
        let element = OrsOutline.buildSection(
          doc,
          "description",
          "section-" + sectionNumber + "-description",
          matches,
          0
        );
        doc.importNode(element, true);
        section.appendChild(element);
      } else {
        ch.iterateMatches(matches, 0, section, sectionNumber);
      }

      let heading = doc.createElement("h2");
      let anchor = doc.createElement("a");

      // Lets us link to this section.
      anchor.setAttribute("href", "#section-" + sectionNumber);
      anchor.appendChild(
        doc.createTextNode(
          ch.chapterNum +
            "." +
            sectionNumber.toString().padStart(3, "0") +
            " - " +
            sectionTitle
        )
      );

      // Display a section heading.
      heading.setAttribute("class", "section-heading");
      heading.appendChild(anchor);

      wordSection.appendChild(heading);
      wordSection.appendChild(section);
    }
    doc.appendChild(wordSection);

    return ch;
  }

  iterateMatches(
    matches,
    currentIndex,
    parent,
    sectionNumber,
    lastLevel = "0"
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
      id = "description";
      text = matches[currentIndex];
      level = "0";
      return;
    } else {
      id = match[1];
      text = "(" + id + ")" + match[2];
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
      console.warn("Parent is null", matches, sectionNumber);
      return;
    }
    divId = parent.getAttribute("id") + "-" + id;
    let element = OrsOutline.buildSection(this.doc, id, divId, text, level);
    parent.appendChild(element);
    // identify subsections
    // build subsection grouping elements

    this.iterateMatches(matches, ++currentIndex, parent, sectionNumber, level);
  }

  static extractRange(node, startRef, endRef) {
    // console.log(node, startRef, endRef);
    // check node.children
    // match (1)(a)(A)(i) etc.

    let start = OregonRevisedStatutesChapter.parseSubsections(startRef);
    let end = OregonRevisedStatutesChapter.parseSubsections(endRef);
    let remove = [];
    let regEx, regStart, regEnd;

    regStart = start.pop();
    regEnd = end.pop();
    regEx = new RegExp("[" + regStart + "-" + regEnd + "]");

    let children = node.children;
    for (var i = 0; i < children.length; i++) {
      let child = children[i];
      let id = child.getAttribute("id");
      if (!id) continue;
      let parts = id.split("-");
      let compare = parts.pop();
      console.log("Comparing ", compare, regEx);
      if (!compare.match(regEx)) {
        console.log("match not found");
        remove.push(child);
      } else {
        console.log("match found");
      }
    }

    for (var n of remove) {
      node.removeChild(n);
    }

    return node;
  }

  // Outputs the document as an HTML string
  toString() {
    let xml = this;

    let work = [
      {
        explanation:
          "Find all Oregon Laws (*not ORS) references with the pattern like '2019 c. 123 § 1'",
        patterns: [
          /(?<year>\d{4})\s*c\.(?<chapter>\d+)\s+[§sS]+(?<section>\d+,*\s?)+/g,
        ],
        replacer: function (groups) {
          return `!OREGON LAWS ${groups.year}!`;
        },
      },
      {
        patterns: [
          /ORS\s+(?<chapter>\w+)\.(?<section>\d+)(?:\s?\((?<subsection>[0-9a-zA-Z]{1,3})\))*/g,
          /(?<!ORS\s+\d*)(?<chapter>\w+)\.(?<section>\d+)(?:\s?\((?<subsection>[0-9a-zA-Z]{1,3})\))*/g,
        ],
        replacer: function (groups) {
          let subsection = groups.subsection ? `(${groups.subsection})` : "";

          return `<a href="/chapter/${groups.chapter}#section-${groups.section}" style="color:blue;" data-action="show-ors" data-chapter="${groups.chapter}" data-section="${groups.section}" data-subsection="${subsection}">ORS ${groups.chapter}.${groups.section}${subsection}</a>`;
        },
      },
    ];

    let transform = false;
    if (!transform) {
      const serializer = new XMLSerializer();
      // const subset = this.doc.querySelector(".WordSection1");

      return serializer.serializeToString(this.getContent());
    }
    for (let node of this.document.getAllTextNodes(xml.doc.documentElement)) {
      let parser,
        frag,
        html = node.data;

      // As the main goal here is to insert links, there should be no need to process links again.
      if (node.parentNode.nodeName == "a") {
        continue;
      }

      for (let job of work) {
        parser = new Parser(job.patterns);
        parser.replaceWith(job.replacer);
        html = parser.parse(html);
      }

      frag = Parser.createDocumentFragment(html);
      node.parentNode.replaceChild(frag, node);
    }
    const serializer = new XMLSerializer();
    const subset = this.doc.querySelector(".WordSection1");

    return serializer.serializeToString(subset);
  }
}
