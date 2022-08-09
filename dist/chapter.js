function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { OrsParser } from "./ors-parser.js";
export { OrsChapter };
/*let doc = load chapter from legislature Site
doc.findAndReplace() <-- links
doc.parse(html)
doc.getAll(sections)
doc.createTOC()
doc.injectAnchors()
doc.toString()
doc.getSection(sectionNum)
doc.highlight(sectionNum)
*/
//import ors parser functions

var OrsChapter = /*#__PURE__*/function () {
  //class variables
  function OrsChapter(chapter) {
    _classCallCheck(this, OrsChapter);

    _defineProperty(this, "section", void 0);

    _defineProperty(this, "document", void 0);

    _defineProperty(this, "sectionTitles", {});

    _defineProperty(this, "sectionHeadings", {});

    this.chapter = chapter;
  }

  _createClass(OrsChapter, [{
    key: "load",
    value: function load() {
      var _this = this;

      return fetch("index.php?chapter=" + this.chapter).then(function (resp) {
        return resp.arrayBuffer();
      }).then(function (buffer) {
        var decoder = new TextDecoder("iso-8859-1");
        return decoder.decode(buffer);
      }).then(function (html) {
        //initialize the parser
        var parser = new DOMParser();
        html = OrsParser.replaceAll(html); //tell the parser to look for html

        _this.doc = parser.parseFromString(html, "text/html"); //createa nodeList of all the <b> elements in the body

        var headings = _this.doc.querySelectorAll("b"); // console.log(headings);


        for (var i = 0; i < headings.length; i++) {
          var boldParent = headings[i];
          var trimmed = headings[i].textContent.trim();
          if (trimmed.indexOf("Note") === 0) continue;
          var strings = trimmed.split("\n");

          var _chapter = void 0,
              section = void 0,
              key = void 0,
              val = void 0;

          console.log(strings); // if array has oonly one element,
          // then we know this doesn't follow the traditional statute pattern.

          if (strings.length === 1) {
            key = strings[0];
            val = boldParent.nextSibling ? boldParent.nextSibling.textContent : "";
          } else {
            // otherwise our normal case.
            key = strings[0];
            val = strings[1];
            var numbers = key.split('.');
            _chapter = numbers[0];
            section = numbers[1];
          }

          console.log(key);
          _this.sectionTitles[parseInt(section)] = val;
          _this.sectionHeadings[parseInt(section)] = boldParent;
        }
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      var serializer = new XMLSerializer();
      var subset = this.doc.querySelector(".WordSection1");
      return serializer.serializeToString(subset);
    }
  }, {
    key: "injectAnchors",
    value: function injectAnchors() {
      // Inserts anchors as div tags in the doc.
      for (var prop in this.sectionTitles) {
        var headingDiv = this.doc.createElement('div');
        headingDiv.setAttribute('id', prop);
        headingDiv.setAttribute('class', 'ocdla-heading');
        headingDiv.setAttribute('data-chapter', chapter);
        headingDiv.setAttribute('data-section', prop);
        var target = this.sectionHeadings[prop];
        target.parentNode.insertBefore(headingDiv, target);
      }
    }
  }, {
    key: "testToC",
    value: function testToC() {
      var network = load(this.chapter);
      return network.then(function (data) {
        var sections, elements, html;

        var _data = _slicedToArray(data, 3);

        sections = _data[0];
        elements = _data[1];
        html = _data[2];
        var volumes = ["Courts, Or. Rules of Civil Procedure", "Business Organizations, Commercial Code", "Landlord-Tenant, Domestic Relations, Probate", "Criminal Procedure, Crimes", "State Government, Government Procedures, Land Use", "Local Government, Pub. Employees, Elections", "Pub. Facilities & Finance", "Revenue & Taxation", "Education & Culture", "Highways, Military", "Juvenile Code, Human Services", "Pub. Health", "Housing, Environment", "Drugs & Alcohol, Fire Protection, Natural Resources", "Water Resources, Agriculture & Food", "Trade Practices, Labor & Employment", "Occupations", "Financial Institutions, Insurance", "Utilities, Vehicle Code, Watercraft, Aviation, Constitutions"];
        var options = volumes.map(function (v, index) {
          return "<option value=\"".concat(index + 1, "\">Volume ").concat(index + 1, " - ").concat(v, "</option>");
        });
        var optionsHtml = options.join("\n");
        var toc = [];

        for (var s in sections) {
          toc.push("<li><a href=\"#".concat(s, "\">").concat(s, " - ").concat(sections[s], "</a></li>"));
        }
      });
    }
  }, {
    key: "createToC",
    value: function createToC() {
      modal.show(); // Network call.

      var network = load(this.chapter, this.section);
      var chapter = new OrsChapter(this.chapter);
      return network.then(function (data) {
        var sections, elements, html;

        var _data2 = _slicedToArray(data, 3);

        sections = _data2[0];
        elements = _data2[1];
        html = _data2[2];
        var volumes = ["Courts, Or. Rules of Civil Procedure", "Business Organizations, Commercial Code", "Landlord-Tenant, Domestic Relations, Probate", "Criminal Procedure, Crimes", "State Government, Government Procedures, Land Use", "Local Government, Pub. Employees, Elections", "Pub. Facilities & Finance", "Revenue & Taxation", "Education & Culture", "Highways, Military", "Juvenile Code, Human Services", "Pub. Health", "Housing, Environment", "Drugs & Alcohol, Fire Protection, Natural Resources", "Water Resources, Agriculture & Food", "Trade Practices, Labor & Employment", "Occupations", "Financial Institutions, Insurance", "Utilities, Vehicle Code, Watercraft, Aviation, Constitutions"];
        var options = volumes.map(function (v, index) {
          return "<option value=\"".concat(index + 1, "\">Volume ").concat(index + 1, " - ").concat(v, "</option>");
        });
        var optionsHtml = options.join("\n");
        var toc = [];

        for (var s in sections) {
          toc.push("<li><a href=\"#".concat(s, "\">").concat(s, " - ").concat(sections[s], "</a></li>"));
        }

        window.location.hash = this.section;
        var nextSection = getNextSection(this.section);
        console.log(nextSection); //good luck :^) goal: do highlighting at level of object
        //OrsParser.highlight(chapter,section,nextSection.dataset.section);
      });
    }
  }, {
    key: "highlight",
    value: function highlight(section, endSection) {
      console.log(chapter);
      console.log(section);
      console.log(endSection);
      var range = this.doc.createRange();
      var firstNode = this.doc.getElementById(section);
      console.log(firstNode);
      var secondNode = this.doc.getElementById(endSection);
      range.setStartBefore(firstNode);
      range.setEndBefore(secondNode);
      console.log(range);
      var newParent = this.doc.createElement('div');
      newParent.setAttribute('style', 'background-color:yellow;');
      range.surroundContents(newParent);
    }
  }, {
    key: "getSection",
    value: function getSection(section) {//do we want to do sections inside this class? or do them in their own class?
    }
  }, {
    key: "getNextSection",
    value: function getNextSection(sectionNum) {
      var headings = this.doc.querySelectorAll('.ocdla-heading');
      var section = this.doc.getElementById(sectionNum);

      for (var i = 0; i < headings.length; i++) {
        if (headings.item(i) == section) {
          var nextSection = headings.item(i + 1);
          return nextSection;
        }
      }
    }
  }]);

  return OrsChapter;
}();