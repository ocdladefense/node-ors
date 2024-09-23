/**
 * @class Outline
 * @description This class is used to create an outline of the ORS chapter.
 */


const OUTLINE_LEVELS = [];

// Some ORS subsections are empty and contain content only for their subsections.
// These are expressed syntactically as "(3)(a)" or "(a)(1)".  We might even imagine they could be found as "(3)(a)(1)".
// export const REGEX_ENUMERATIVE_PAIR = /(^\([0-9a-zA-Z]+\)\([0-9a-zA-Z]+\))/gm;
// An alternate, shorter form of the above which would also match "(3)(a)(1)";
// whereas the abhove only captures two adjacent subsections.
export const REGEX_ENUMERATIVE_PAIR = /(^\([0-9a-zA-Z]+\)){2,}/gm;

export const REGEX_ENUMERATIVE = /^\(([0-9a-zA-Z]+)\)(.*)/;

// Level 0 should refer to the chapter itself;
// For placeholder purposes only. Never used.
const LEVEL_0_REGEX = null;

// Level 1 is marked by numbers for sections and - for now - should not be used.
const LEVEL_1_REGEX = null;

// Level 1 is marked by numbers and takes the form of "(1)" or "(2)".
const LEVEL_2_REGEX = "[0-9]+";

// Level 2 is marked by lowercase letters and takes the form of "(a)" or "(b)".
const LEVEL_3_REGEX = "[a-z]{1}";

// Level 3 is marked by uppercase letters and takes the form of "(A)" or "(B)".
const LEVEL_4_REGEX = "[A-Z]+";

// Level 4 is marked by small roman numerals and takes the form of "(i)" or "(ii)".
// 1, 5, 10, 50, 100, 500, and 1,000 are represented by the characters i, v, x, l, c, d, and m respectively.
const LEVEL_5_REGEX = "[ivxlcdm]+";

// Level 4 is marked by small roman numerals and takes the form of "(i)" or "(ii)".
// 1, 5, 10, 50, 100, 500, and 1,000 are represented by the characters i, v, x, l, c, d, and m respectively.
const LEVEL_6_REGEX = "[IVXLCDM]+";

export const OUTLINE_LEVEL_0 = 0;

export const OUTLINE_LEVEL_1 = 1;

export const OUTLINE_LEVEL_2 = 2;

export const OUTLINE_LEVEL_3 = 3;

export const OUTLINE_LEVEL_4 = 4;

export const OUTLINE_LEVEL_5 = 5;

export const OUTLINE_LEVEL_6 = 6;

export const OUTLINE_LEVEL_UNKNOWN = -1;

const CHAPTER_NUMERAL = 0;

const SECTION_NUMERAL = 1;

const SUBSECTION_NUMERAL = 2;

const SUBSECTION_LOWERCASE = 3;

const SUBSECTION_UPPERCASE = 4;

const SUBSECTION_SMALL_ROMAN_NUMERAL = 5;

const SUBSECTION_BIG_ROMAN_NUMERAL = 6;

const SAMPLE_PATH = [
  CHAPTER_NUMERAL,
  SECTION_NUMERAL,
  SUBSECTION_NUMERAL,
  SUBSECTION_LOWERCASE,
  SUBSECTION_UPPERCASE,
  SUBSECTION_SMALL_ROMAN_NUMERAL,
  SUBSECTION_BIG_ROMAN_NUMERAL,
];


OUTLINE_LEVELS[OUTLINE_LEVEL_0] = LEVEL_0_REGEX;
OUTLINE_LEVELS[OUTLINE_LEVEL_1] = LEVEL_1_REGEX;
OUTLINE_LEVELS[OUTLINE_LEVEL_2] = LEVEL_2_REGEX;
OUTLINE_LEVELS[OUTLINE_LEVEL_3] = LEVEL_3_REGEX;
OUTLINE_LEVELS[OUTLINE_LEVEL_4] = LEVEL_4_REGEX;
OUTLINE_LEVELS[OUTLINE_LEVEL_5] = LEVEL_5_REGEX;
OUTLINE_LEVELS[OUTLINE_LEVEL_6] = LEVEL_6_REGEX;

const OP_REFERENCE_SEPARATOR = ",";

const OP_REFERENCE_RANGE = "-";

const CHAR_REFERENCE_SPACE = " ";

const CHAR_SUBSECTION_OPEN = "(";

const CHAR_SUBSECTION_CLOSE = ")";

const CHAR_CHAPTER_SECTION_SEPARATOR = ".";

const CHAR_HYPHEN_SEPARATOR = "-";


/**
let text = "138.5(3)(a),(4)(a)-(c)";
Parser.parseReferences(text);
 */
export function parseReferences(refs) {

    let fn = function(ref) {
        let matches = ref.match(/^\d+(\.\d+)?/);
        return matches ? matches[0] : null; 
    };

    let foo = function(partial) {
        let empty = SAMPLE_PATH.slice().fill(null);

        if(partial.length < 1) return empty;
        for(let i = 0; i < partial.length; i++) {
            empty[i] = partial[i];
        }

        return empty;
    };

    let sections = refs.split(OP_REFERENCE_SEPARATOR)
    .map((ref) => {return ref.includes(OP_REFERENCE_RANGE) ? ref.split(OP_REFERENCE_RANGE) : ref})
    .map(ref => Array.isArray(ref) ? ref.map(ref => ref.trim()) : ref.trim())
    .map(ref => Array.isArray(ref) ? ref.map(fn) : fn(ref))
    .map(ref => Array.isArray(ref) ? ref.map(ref => {
        if(null == ref) return [];
        
        let parts = ref.split(".");
        
        if(parts.length > 1) {
            return parts.reverse();
        } else {
            return [null, parts[0]];
        }
    }) : ref.split("."))
    .map(ref => Array.isArray(ref[0]) ? ref.map(foo) : foo(ref));

    console.log("Sections are: ",sections);

    sections = flatten(sections);

    console.log("Sections are: ",sections);
    

    sections = merge(sections);

    console.log("Sections are: ",sections);
    let result = [];


  let partials = refs
    .split(OP_REFERENCE_SEPARATOR)
    .map((ref) => {return ref.includes(OP_REFERENCE_RANGE) ? ref.split(OP_REFERENCE_RANGE) : ref})
    .map(ref => Array.isArray(ref) ? ref.map(ref => ref.trim()) : ref.trim())
    .map(ref => { return Array.isArray(ref) ? ref.map(_parseReferences) : _parseReferences(ref); })
    .map((partial) => {
      return Array.isArray(partial[0]) ? partial.map(toMatrix) : toMatrix(partial);
    })
    .map(matrix => Array.isArray(matrix[0]) ? [matrix[0],addPaths(matrix[0],matrix[1])] : matrix);
    partials = flatten(partials);
    

    return sections.map((elem,index) => { elem.unshift("x"); let partial = partials[index]; partial.unshift("s"); return addPaths(elem,partials[index])});
}



function flatten(arr) {
    let result = [];

    arr.forEach(elem => Array.isArray(elem[0]) ? elem.flat(0).forEach(elem => result.push(elem)) : result.push(elem));

    return result;
}



function toMatrix(parts) {
    if(parts.length < 1) return SAMPLE_PATH.slice().fill(null);
  let tmp = parts.map((part) => toPath(part));
  let matrix = tmp.reduce((acc, val) => addPaths(acc, val));
  console.log(matrix);
  return matrix;
}

export function _parseReferences(ref) {
  let regex = /(?<=\()(\w+)(?=\))+?/g;
  return ref.match(regex);
}

export function toPath(value, comparison = null) {
  let matrix = SAMPLE_PATH.slice().fill(null);
  let position = comparison ? Outline.getPosition(value,comparison) : Outline.getPosition(value);
  matrix[position] = value;

  return matrix;
}

export function addPaths(matrix1, matrix2) {
  let result = matrix1.slice();
  for (var i = 0; i < matrix1.length; i++) {
    result[i] = matrix2[i] || matrix1[i];
  }

  return result;
}


function merge(arr) {
    let paint = (elem,index,arr) => {
        let previous = arr[index-1] || SAMPLE_PATH.slice().fill(null);
        return addPaths(previous,elem);
    };
    return arr.map(paint).map(paint);
}






export default class Outline {
  static getPosition(str, comparison = null) {

    for (let level = (comparison ? Outline.getPosition(comparison)+1 : OUTLINE_LEVEL_2); level < OUTLINE_LEVELS.length; level++) {
      if(!OUTLINE_LEVELS[level]) continue;
      let regex = new RegExp(`^(?<label>${OUTLINE_LEVELS[level]})$`);
      let matches = str.match(regex);
      // console.log(matches);
      if (matches) {
        return parseInt(level);
      }
    }
    return parseInt(OUTLINE_LEVEL_UNKNOWN);
  }

  static matchLevel(str) {
    for (let level = OUTLINE_LEVEL_2; level < OUTLINE_LEVELS.length; level++) {
      let regex = new RegExp(`^\\((?<label>${OUTLINE_LEVELS[level]})\\)`);
      let matches = str.match(regex);
      console.log(matches);
      if (matches) {
        return [parseInt(level), matches.groups.label];
      }
    }
    return [OUTLINE_LEVEL_UNKNOWN, str];
  }

  static assignLevel(str, previousLevel = OUTLINE_LEVEL_UNKNOWN) {
    let [level, label] = Outline.matchLevel(str);

    if (level == OUTLINE_LEVEL_4 && previousLevel == OUTLINE_LEVEL_2) {
      return [OUTLINE_LEVEL_2, label];
    } else return [level, label];
  }
}
