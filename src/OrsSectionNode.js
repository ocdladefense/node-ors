import OrsNode from "./OrsNode.js";


export default class OrsSectionNode extends OrsNode {
  #nodeName = "#orschapter";

  constructor(node) {
    super(node);
  }

  findEmptyHeadings() {
    let fn = function (match, p1, offset, original) {
      let duo = match.split(")(");
      return duo.join(")\n(");
    };

    let matches = text.replaceAll(/(^\([0-9a-zA-Z]+\)\([0-9a-zA-Z]+\))/gm, fn);
    matches = matches.match(gSubRe);

    return matches === null ? [header, text] : [header, matches];
  }
}
  