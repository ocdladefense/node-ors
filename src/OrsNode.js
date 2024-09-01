import OrsNodeTypes from './OrsNodeTypes.js';




export default class OrsNode {
  // The underlying DOM node implementation.
  node;

  // The document object that owns this node.
  ownerDocument;

  constructor(node, ownerDocument = null) {
    this.node = node;
    this.ownerDocument = ownerDocument || node.ownerDocument;
  }

  doForEach(selectorOrNodes, callback) {
    (Array.isArray(selectorOrNodes)
      ? selectorOrNodes
      : [...this.node.querySelectorAll(selector)]
    ).forEach(callback);
  }

  
  // Trim whitespace from the beginning and end of the string.
  trimAll(selector) {
    for (let elem of this.node.querySelectorAll(selector)) {
      elem.innerHTML = elem.innerHTML.trim();
    }
  }

  replaceInnerHTMLString(selector, str, replacement) {
    for (let elem of this.node.querySelectorAll(selector)) {
      elem.innerHTML = elem.innerHTML.replaceAll(str, replaceement);
    }
  }

  querySelector(selector) {
    return this.node.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.node.querySelectorAll(selector);
  }

  setInnerHTML(html) {
    this.node.innerHTML = html;
  }

  setInnerText(text) {
    this.node.innerText = text;
  }

  getAllTextNodes() {
    let textNodes = [];

    function recurse(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      } else if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          recurse(node.childNodes[i]);
        }
      }
    }

    recurse(this.node);
    return textNodes;
  }

  removeAttributes(attrName) {
    // remove styling from each span
    for (var elements in spans) {
      let element = spans[elements];
      if (element.style) {
        element.style = null;
      }
    }
    // console.log(contents);
  }

  removeNodes(selector) {
    let nodes = this.node.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      node.parentNode.removeChild(node);
    }
  }

  /**
   *
   * @param {Function} replacerFn - A function that takes the existing text content and returns the new text content.
   */
  replaceText(replacerFn) {
    [this.getAllTextNodes()].forEach((node) => {
      let text = node.data;
      let newText = replacerFn(text);
      let newNode = this.document.createTextNode(newText);
      node.parentNode.replaceChild(newNode, node);
    });
  }
}










