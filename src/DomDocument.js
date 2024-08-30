

export default class DomDocument {
  #doc;

  constructor(doc) {
    this.#doc = doc;
  }
  getRangeBetweenSections(node1, node2) {
    let range = this.#doc.createRange();

    try {
    range.setStartAfter(node1);
    range.setEndBefore(node2);
  } catch (e) {
    console.error(node1, node2);
    throw e;
  }
    return range;
  }
}