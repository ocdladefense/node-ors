/**
 * Do not use - for reference only!
 */
class Legacy {
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
      let element = this.document.createSection();

      if (false && section.hasSubsection()) {
        ch.iterateMatches(matches, 0, section, sectionNumber);
      } else {
        let wellFormed = this.document.createSection(
          "description",
          "section-" + sectionNumber + "-description",
          text.pop(),
          0
        );
        section.appendChild(element);
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

      section.appendChild(heading);
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


}