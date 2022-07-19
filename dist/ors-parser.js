function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _wrapRegExp() { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, void 0, groups); }; var _super = RegExp.prototype, _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = new RegExp(re, flags); return _groups.set(_this, groups || _groups.get(re)), _setPrototypeOf(_this, BabelRegExp.prototype); } function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { return groups[name] = result[g[name]], groups; }, Object.create(null)); } return _inherits(BabelRegExp, RegExp), BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); return result && (result.groups = buildGroups(result, this)), result; }, BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if ("string" == typeof substitution) { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } if ("function" == typeof substitution) { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = arguments; return "object" != _typeof(args[args.length - 1]) && (args = [].slice.call(args)).push(buildGroups(args, _this)), substitution.apply(this, args); }); } return _super[Symbol.replace].call(this, str, substitution); }, _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

export { OrsParser };

var OrsParser = function () {
  var proto = {};
  var patterns = [/*#__PURE__*/_wrapRegExp(/ORS\s+(\d+)\.(\d+)(?:\s?\(([0-9a-zA-Z]{1,3})\))*/g, {
    chapter: 1,
    section: 2,
    subsection: 3
  }),
  /*#__PURE__*/
  // /ORS\s+(?<chapter>\d+)\.(?<section>\d+)/g,
  // /(?<!ORS\s+\d+)((?<chapter>\d+)\.(?<section>\d+))/g
  _wrapRegExp(/(?:\d{4}\s)*c\.(\d+)\s+\xA7+(\d+,*\s?)+/g, {
    chapter: 1,
    section: 2
  })];
  var replacers = [];

  var replacer = function replacer(match, p1, p2, offset, string, g) {
    // console.log(arguments);
    var length = arguments.length - 3;
    var memorized = Array.prototype.slice.call(arguments, length);
    var groups = memorized.pop(); // console.log(groups);

    var subsection = groups.subsection ? "(".concat(groups.subsection, ")") : "";
    var link = "<a href=\"#\" data-action=\"show-ors\" data-chapter=\"".concat(groups.chapter, "\" data-section=\"").concat(groups.section, "\" data-subsection=\"").concat(subsection, "\">ORS ").concat(groups.chapter, ".").concat(groups.section).concat(subsection, "</a>");
    return link;
  };

  function replaceAll(text) {
    // let regexp = /ORS\s+(\d{3})/g;
    var _iterator = _createForOfIteratorHelper(patterns),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var regexp = _step.value;
        text = text.replaceAll(regexp, replacer); // console.log(text);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return text;
  }

  function parseOrs(text) {
    var linked = replaceAll(text); // "123.123&nbsp;&nbsp;&nbsp;&nbsp;"

    var foo = linked.replaceAll( /*#__PURE__*/_wrapRegExp(/(\d{3})\.(\d{3})(\s{4,})/g, {
      chapter: 1,
      section: 2,
      spaces: 3
    }), function (match, p1, p2, p3, offset, string, groups) {
      return "<a href=\"#".concat(groups.chapter, ".").concat(groups.section, "\" data-action=\"ors-nav\" data-chapter=\"").concat(groups.chapter, "\" data-section=\"").concat(groups.section, "\">").concat(groups.chapter, ".").concat(groups.section, "</a>").concat(groups.spaces);
    });
    return foo;
  }

  function matchAll() {
    var regexp = /*#__PURE__*/_wrapRegExp(/ORS\s+(\d{3})\.(\d{3})/g, {
      chapter: 1,
      section: 2
    }); // let foo = "ORS 123.123".matchAll(regexp);


    var foo = "1987 c.833 §3; 1989 c.453 §2; 1993 c.186 §4; 1995 c.102 §1; 1999 c.448 §1; 1999 c.599 §1; 2021 c.539 §109".matchAll(/\d{4}\s+c\.\d{3}\s+§\d+/g);

    var results = _toConsumableArray(foo);

    console.log(results);
  }

  function highlight(chapter, section) {
    var endSection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var doc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    console.log(chapter);
    console.log(section);
    var range = doc ? doc.createRange() : new Range();
    doc = doc || document;
    endSection = endSection || section + 1;
    section = padZeros(section);
    endSection = padZeros(endSection);
    console.log(section, endSection);
    var start = chapter + '.' + section;
    var end = chapter + '.' + endSection;
    console.log(start, end);
    var firstNode = doc.getElementById(start);
    var secondNode = doc.getElementById(end);
    range.setStartBefore(firstNode);
    range.setEndBefore(secondNode);
    console.log(range);
    var newParent = doc.createElement('div');
    newParent.setAttribute('style', 'background-color:yellow;');
    range.surroundContents(newParent);
  }

  function padZeros(section) {
    if (section < 10) {
      return "00" + section;
    }

    if (section < 100) {
      return "0" + section;
    }

    return "" + section;
  }

  function OrsParser() {}

  OrsParser.prototype = proto;
  OrsParser.highlight = highlight;
  OrsParser.replaceAll = replaceAll;
  OrsParser.padZeros = padZeros;
  return OrsParser;
  /*
  DOES NOT WORK
  Range {commonAncestorContainer: div.wordsection1, startContainer: p.msonormal, startOffset: 0, endContainer: p.msonormal, endOffset: 0, …}
  collapsed: false
  commonAncestorContainer: div.wordsection1
  endContainer: p.msonormal
  endOffset: 0
  startContainer: p.msonormal
  startOffset: 0
  [[Prototype]]: Range
  */

  /*
  WORKS
  Range {commonAncestorContainer: div.WordSection1, startContainer: div.WordSection1, startOffset: 384, endContainer: div.WordSection1, endOffset: 436, …}
  collapsed: false
  commonAncestorContainer: div.WordSection1
  endContainer: div.WordSection1
  endOffset: 385
  startContainer: div.WordSection1
  startOffset: 384
  [[Prototype]]: Range
  */
}();