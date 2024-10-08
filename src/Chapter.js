import OrsDocumentNode from './node/OrsDocumentNode.js';
import Matcher from './utility/Matcher.js';
import ChapterInitPhases from './ChapterInitPhases.js';
import {truncate} from './utility/Matrix.js';


// Fetches the contents of the original ORS chapter from the Oregon Legislature web site.
// Transforms it in to a well-formed HTML document.
export default class Chapter {
  // The chapter number.
  chapterNum = null;

  // Title of this chapter - must be a string.
  title;

  // The chapter's underlying XML document.
  document;

  // Contains references to DOM node <b> elements.
  // Might be unused.
  sectionHeadings = [];

  // Parsed title of each section of this chapter.
  sectionTitles = {};

  // An array of metadata about each section, including the
  // chapter number, section number, and title.
  metadata = [];

  #loadPhases = {};

  constructor(chapterNum) {
    this.chapterNum = chapterNum;
    this.orsDocumentNode = new OrsDocumentNode();

    this.#loadPhases[ChapterInitPhases.LOAD_SECTION_TITLES] =
      this.loadSectionTitles;
    this.#loadPhases[ChapterInitPhases.LOAD_SECTION_TITLE_NODES] =
      this.loadSectionTitleNodes;
    this.#loadPhases[ChapterInitPhases.ADD_SECTION_ANCHOR_NODES] =
      this.addSectionAnchorNodes;
    this.#loadPhases[ChapterInitPhases.WRAP_SECTIONS] =
      this.wrapSectionsWithNodes;
    this.#loadPhases[ChapterInitPhases.WRAP_SECTIONS_RECURSIVE] =
      this.wrapSectionsWithNodes;
  }

  setTitle(title) {
    this.title = title;
  }



  async download() {

      let html = this.document.node.documentElement.outerHTML;
      console.log("HTML is: ", html);
      // An array consisting of a single string.
      const blobParts = [html];
      const blob = new Blob(blobParts, { type: "text/html" }); // the blob

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      // the filename you want
      a.download = "ors-chapter-" + this.chapterNum + ".html";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  }


  /**
   *
   * @param {Response} resp
   * @param {Integer} chapterNum
   * @returns Chapter
   *
   * Convert a Response object into a Chapter object.
   * The raw HTML is obtained either directly from the OregonLegislature.gov website or from a local or cached file.
   * However, the underlying HTML needs to be transformed into a well-formed HTML document.
   * To do this, we transform the underlying document incrementally by executing a series of load phases.
   * A completed Chapter object enables methods like getSection() or queryReference("128.010(1)-(3)") to extract specific sections from the document.
   */
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
        chapter.loadSectionMetadata();
        chapter.writeSectionAnchors();

        

        chapter.wrapSections();

        
        chapter.processWhitespace();
        // console.log(chapter.sectionTitles);



        /**
         * Let's document what this code is trying to do.
         */
        /* for(let sectionNumber in chapter.sectionTitles) {
          let oldNode = chapter.document.getSection(sectionNumber).replaceWithNewNode();
          let node = chapter.document.getSection(sectionNumber);
          // console.log(node.toNode());
        }
        */


        // chapter.download();
          

        return chapter;
        chapter.init(
          // Locate all of the document's section titles (usually in <b> tags) and store the text in an array for future use.
          ChapterInitPhases.LOAD_SECTION_TITLES,

          // Do the same with references to the <b> elements themselves.
          ChapterInitPhases.LOAD_SECTION_TITLE_NODES,

          // Add anchor nodes to the document to allow for easy linking to sections.
          ChapterInitPhases.ADD_SECTION_ANCHOR_NODES,

          // Wrap each section in a container node.
          ChapterInitPhases.WRAP_SECTIONS_WITH_NODES

          // Do the same for subsections, and their own subsections.
          // ChapterInitPhases.WRAP_SECTIONS_WITH_NODES_RECURSIVE
        );

        return chapter;
      });
  }



  querySelectorAll(selectors) {

    let document = this.getDocumentNode();
    console.log("Selector are: ",selectors);

    let sections = document.querySelectorAll(selectors);
    console.log("Sections are: ",sections);
    // console.log("Section toString()", section.toString());
    // console.log("Section getText()", section.getText());
    if(null == sections || (sections.length && sections.length == 0)) {
      console.warn("No sections found for selectors: ", selectors);
    }
    // let sections = [section.toNode()];
    return [...sections];
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
    this.document.trimAll("span", true);
    this.document.trimAll("b");
    this.document.trimAll("h2", true);
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

  loadSectionMetadata() {
    this.sectionHeadings = [...this.document.querySelectorAll("b")].filter(n => !!n.textContent && n.textContent.trim().match(/^\d+\.\d+/));
    
    let titles = this.sectionHeadings.map((node) => node.textContent.trim());

    this.metadata = titles.map(fn);


    this.metadata.forEach((triplet) => {
      let [chapter, section, title] = triplet;
      this.sectionTitles[section.toString()] = title;
    });

    function fn(_title) {
      // Ignore some labels that would otherwise be considered titles but *aren't titles.
      // For example, some labels start with "Note" and are not part of the statutes.
      // if(label.indexOf("Note") === 0) return null; //return [99,99,"Amended"];

      // Distinguish between "138.010" and the title.
      // This helps to solve for the form: "138.010\nTitle of the statute".
      let [enumeration, title] = _title.split("\n");
      let [chapter, section] = enumeration.split(".");

      // If val wasn't set then we know this doesn't follow the regular statute pattern.
      // val = boldParent.nextSibling ? boldParent.nextSibling.textContent : "";
      return [parseInt(chapter), parseInt(section), title || "Amended or Repealed"];
    }
  }

  writeSectionAnchors() {
    // Inserts anchors as <div> tags in the doc.
    // Note: this affects the underlying structure
    // of the XML document.
    console.log("Metadata is: ", this.metadata);

    this.metadata.forEach((triplet, index) => {
      let [chapter, section, title] = triplet;
      let b = this.sectionHeadings[index];
      let anchor = this.document.createSectionAnchor(section);
      b.parentNode.parentNode.insertBefore(anchor, b.parentNode);
    });

    console.log("Anchors added to the document.");
    console.log(this.document.node);
  }

  


  // Convert matrixes into DOMString selectors for use in document.querySelector().
  // For now, selectors will largely consist of IDs.
  // For example, "section-10-1" will select the first subsection of ORS 128.010
  //   using the selector, "#section-10-1".
  toSelectors(matrixes, prefix="section", type = "id", truncateNulls = true) {

    // Remove unused (null) location elements from the matrix path.
    matrixes = matrixes.map(truncate);
    let groups = [];

    for(let i = 0; i < matrixes.length; i++) {
      
      let indicatorBit = matrixes[i][0];
      let start = matrixes[i].slice(1);
      let end = 0 === indicatorBit ? start.slice() : matrixes[++i].slice(1);

      groups.push(start);
      groups.push(end);
    }

    // WE SHOULD NOW BE WORKING WITH GROUPS!!!
    // Use odd/even a method for solving a problem 

    // We've consumed the indicator bit, so remove it.
    groups = groups.map(m => m.slice(1));

    // Also remove the chapter element, which is inferred from this context.
    // groups = groups.map(m => {m.shift(); return m;});

    // ID selectors can't start with a number; prepend with the given prefix.
    groups = groups.map(m => { m.unshift(prefix); return m.join("-"); });

    return groups.map((sel,index) => index % 2 == 0 ? ("#"+sel) : ("[id*='"+sel+"']"));
  }



  /**
   * 
   * @param {String} sel1
   * @param {String} sel2 
   */
  getRange(sel1, sel2 = null) {

    let document = this.getDocumentNode();


    let node1 = this.document.querySelector(sel1);
    if(null == node1) {
      throw new Error("Node not found for selector: "+sel1);
    }
    let endNodes = [...this.document.querySelectorAll(sel2)];
    let node2 = endNodes[endNodes.length - 1];

    // Inclusive is passed as true to include the start and end nodes in the range.
    return document.getRangeBetweenSections(node1, node2, true);
  }




  getNodes(selectors) {
    let nodes = [];
    // Loop through pairs of selectors calling getRange() for each pair.

    for(let i = 0; i < selectors.length; i += 2) {
      let range = this.getRange(selectors[i],selectors[i+1]);
      nodes.push(range.cloneContents());
    }

    return nodes;
  }


  toString() {

    const serializer = new XMLSerializer();
    const subset = this.document.querySelector(".WordSection1");

    return serializer.serializeToString(subset);
  }

  // Outputs the document as an HTML string
  __toString() {
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
        parser = new Matcher(job.patterns);
        parser.replaceWith(job.replacer);
        html = parser.parse(html);
      }

      frag = Matcher.createDocumentFragment(html);
      node.parentNode.replaceChild(frag, node);
    }
    const serializer = new XMLSerializer();
    const subset = this.doc.querySelector(".WordSection1");

    return serializer.serializeToString(subset);
  }
}


