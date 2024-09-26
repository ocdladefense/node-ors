import OrsNode from "./OrsNode.js";
import Outline from "../utility/Outline.js";
import { REGEX_ENUMERATIVE_PAIR, REGEX_ENUMERATIVE, OUTLINE_LEVEL_UNKNOWN, OUTLINE_LEVEL_0} from "../utility/Outline.js";

export default class OrsSectionNode extends OrsNode {
  #nodeName = "#orssection";


  #sectionNumber;


  constructor(node, ownerDocument) {
    super(node, ownerDocument);
  }



  toNode() {
    return this.node;
  }


  importNode(node) {

    let heading = this.document.createElement("h2");
    let anchor = this.document.createElement("a");
    let sectionNumber = "1";
    let sectionTitle = "Title of the statute";
    let id = node.getAttribute("id");


    // Lets us link to this section.
    anchor.setAttribute("href", "#"+id);
    anchor.appendChild(
      this.document.createTextNode(
        this.chapterNum +
          "." +
          sectionNumber.toString().padStart(3, "0") +
          " - " +
          sectionTitle
      )
    );

    // Display a section heading.
    heading.setAttribute("class", "section-heading");
    heading.appendChild(anchor);

    section.appendChild(heading);
  }


  setSectionNumber(sectionNumber) {
    this.#sectionNumber = sectionNumber;
  }


  hasSubsections() {

    let paragraphs = this.getText();

    for(let p of paragrpahs) {
      if (paragraph.test(REGEX_ENUMERATIVE)) return true;
    }

    return false;
  }


  /**
   * Each non-empty section consists of one or more paragraphs.
   * @returns {Array<HtmlParagraphElement>}
   */
  getParagraphs() {
    return this.node.querySelectorAll("span"); 
  }


  toTree(branch = null) {
    let trunk = this.node.cloneNode(false);

    this.node.children.forEach();
  }

  replaceWithNewNode() {

    // Keep the top-level section that was already inserted into the document tree.
    let section = this.node.cloneNode(false);
    let previousLevel = OUTLINE_LEVEL_0;
    let idParts = [this.node.getAttribute("id")];

    let quadruplets = this.getText().map((text) => {
      // Each assignment consists of a numeric level and a commensurate label (i.e., "1","2","a","b","A","B","i","ii").
      let [level, label] = Outline.assignLevel(text, previousLevel);

      

      if (level == OUTLINE_LEVEL_UNKNOWN) {
      } else if (level > previousLevel) {
        idParts.push(label);
      } else if (level < previousLevel) {
        idParts.pop();
        for(let diff = 1; diff <= previousLevel - level; diff++) {
          idParts.pop();
        }
        idParts.push(label);
      } else if (level == previousLevel) {
        idParts.pop();
        idParts.push(label);
      }

      let id = idParts.join("-");
      previousLevel = level;

      return [level, label, id, text];
    });

    quadruplets.forEach((quadruplet) => {
      let [level, label, id, text] = quadruplet;
      let node = this.ownerDocument.createElement("div");
      node.appendChild(this.ownerDocument.createTextNode(text));
      section.appendChild(node);

      if (level != OUTLINE_LEVEL_UNKNOWN) {
        node.setAttribute("id", id);
        node.setAttribute("class", "level-" + level);
      }
    });


    let oldNode = this.node.parentNode.replaceChild(section, this.node);
    this.node = section;

    return oldNode;
  }


  /**
   * Return an array of strings representing the individual paragraphs of the section.
   * @returns {Array<String>}
   */
  getText() {

    let FIX_COUPLED_ENUMERATIVES = function (match, p1, offset, original) {
      let coupled = match.split(")(");
      return coupled.join(")\n(");
    };

    // Remove leading and trailing whitespace from the text.
    let _paragraphs = [...this.getParagraphs()].map(p => p.textContent.trim());

    // Remove line breaks.
    let paragraphs = _paragraphs.map(text => text.replaceAll("\n", " ")).filter(text => text.length > 0);
    
    // Add extra line breaks between enumerative pairs of the form "(1)(a)", etc.
    let tmp = paragraphs.join("\n").replaceAll(REGEX_ENUMERATIVE_PAIR, FIX_COUPLED_ENUMERATIVES);

    return tmp.split("\n");
  }




  toString() {
    return this.getText().join("\n");
  }
}
  