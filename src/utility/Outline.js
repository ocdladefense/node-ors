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
export const REGEX_ENUMERATIVE_PAIR = /^(\([0-9a-zA-Z]+\)){2,}/gm;

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
const LEVEL_4_REGEX = "[A-Z]{1}";

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
      if (matches) {
       // console.log(matches);
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
