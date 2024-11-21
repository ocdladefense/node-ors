
// References are ordered in the order that they are to be displayed.



const OP_REFERENCE_SEPARATOR = ",";

const OP_REFERENCE_RANGE = "-";


/**
 * @class Parser
 * @description Parses ORS references in text and replaces them with links.
 * @example
 * let text = "ORS 123.123";
 * let linked = Parser.replaceAll(text);
 */
const Matcher = (function () {


  /**
   * Parses an ORS reference string and returns an array of IDs. These IDs can be used to select DOM nodes.
   *
   * @example
   * // Returns ['138-005-1', ['138-005-2', '138-005-4-b'], '138-005-5-a']
   * let ids = parseOrsReference('138.005(1),(2)-(4)(b),(5)(a)');
   * let nodes = ids.map((id) => { if(Array.isArray(id) ? this.document.getRange(...id) : document.getElementById(id)});
   * @param {string} ref - The ORS reference string to parse.
   * @return {Array<string>} An array of IDs, where each ID is a string representing a section or a range of sections on the webpage.
   */
  function parseOrsReference(ref) {
    // This finds where each section changes
    const sectionRegex = /(\w+\.\w+(\([a-zA-Z0-9]+\),?-?)+)/g;
    const sections = ref.match(sectionRegex);

    console.log(sections);

    // This is our return array which will be populated with our ids
    let ids = [];

    // Loop through each section. Each loop is essentially a different prefix.
    sections.forEach((section) => {
      // Define our prefix and remove it
      // This removes, as an example, '138.005' from '138.005(1),(2)-(4)(b),(5)(a)' and saves it as '135-005' in prefix.
      const prefixRegex = /(\w+\.\w+)/g;
      let prefix = section.match(prefixRegex)[0];
      section = section.replace(prefix, "");
      prefix = prefix.replace(".", "-");

      // Split each section by commas, and remove empty strings from trailing commas
      // Continuing our example from above: ['(1)', '(2)-(4)(b)', '(5)(a)']
      const refParts = section.split(",").filter((part) => part.trim() !== "");

      // Separate each reference group into parts
      // Continuing our example from above: [['(1)'], ['(2)', '-', '(4)', '(b)'], ['(5), (a)']]
      const partRegex = /(\(\w*\)|-)/g;
      for (let i = 0; i < refParts.length; i++)
        refParts[i] = refParts[i].match(partRegex);

      // Perform some cleanup on our parts, removing parentheses and whitespace
      // Continuing our example from above: [['1'], ['2', '-', '4', 'b'], ['5', 'a']]
      for (let i = 0; i < refParts.length; i++)
        for (let j = 0; j < refParts[i].length; j++)
          refParts[i][j] = refParts[i][j]
            .replace("(", "")
            .replace(")", "")
            .trim();

      // Flatten arrays of characters with a '-' if they are not ranges
      // ['1', ['2', '-', '4', 'b'], '5-a']
      for (let i = 0; i < refParts.length; i++) {
        // If an array part has a '-', it's a range and we want to preserve it
        if (refParts[i].includes("-")) break;
        console.log(refParts[i]);
        refParts[i] = refParts[i].join("-");
      }

      // Create duple array bookends from the remaining arrays
      // ['1', ['2', '4-b'], '5-a']
      for (let i = 0; i < refParts.length; i++) {
        if (Array.isArray(refParts[i])) {
          // Cut the array in half at the '-'
          const duple = refParts[i].splice(
            refParts[i].findIndex((part) => part === "-")
          );

          // Remove the '-' from the array. It should always be the first element since we're cutting the array in half at that point.
          duple.shift();

          // Reduce the two arrays to two strings
          refParts[i] = [refParts[i].join("-"), duple.join("-")];
        }
      }

      // Build our IDs, attaching our prefix to each part
      // ['138-005-1', ['138-005-2', '138-005-4-b'], '138-005-5-a']
      for (let i = 0; i < refParts.length; i++) {
        // Take into account our ranges and access those arrays to perform the same action
        if (Array.isArray(refParts[i]))
          for (let j = 0; j < refParts[i].length; j++)
            refParts[i][j] = `${prefix}-${refParts[i][j]}`;
        else refParts[i] = `${prefix}-${refParts[i]}`;
      }

      // Add our parts to our ids
      ids = ids.concat(refParts);
    });

    return ids;
  }

  /**
let text = "138.5(3)(a),(4)(a)-(c)";
Parser.parseReferences(text);
 */
  function parseReferences(refs) {
    let seq = refs
      .split(OP_REFERENCE_SEPARATOR)
      .map((ref) => ref.split(OP_REFERENCE_RANGE));

    let f = seq.map((ref) => ref.map(parseReference2));
    return f;
    // return matches.join(CHAR_HYPHEN_SEPARATOR);
  }

  function parseReference2(ref) {
    let regex = /(?<=\()(\w+)(?=\))+?/g;
    debugger;
    return ref.match(regex);
  }

  function locate(ref1, ref2 = null, algo = ReferenceAlgorithm.INTERSECT) {
    /*
Step 1:
"138.005(1),(2)-(4),(5)(a)"

Step 2: Convert into a sequence based on comma.
[138.005(1),(2)-(4),(5)(a)]

Step 3: Convert ranges into array couples.
// Reference can include a single section or a "range" of sections.
// Sequence of references, any given reference when it is itself a array should be interpreted as indicating a "range"
[138.005(1),[(2),(4)],(5)(a)]

Step 4: Map to a RegExp, i.e., /\(((?<ref>)\w+)\)+/g;
// An array of subsection suffixes; some suffixes still indicate a range.
[1,[2,4],[5-a]]

Step 5: Define our prefix.
let prefix = [138,5];

Step 6: Build our ids from the prefix.
// Goal: return a list of strings that represent either individual nodes **or** ranges of nodes.
let ids = [138-5-1,[138-5-2,138-5-4],138-5-5-a];

Step 7: Convert ids into actual DOMStrings.
// Array of DOMStrings that are the ids of the nodes we want to select.
// A DOMString tha is itself an array should be interpreted as a range of ids.
let actualIds = ids.map(id => // assign the prefix as well);

Step 8: Return our ids as an array of DOMStrings, which may include couples.


Step 9: Consume the IDs to retrieve DOM Nodes.
// Last step converts a sequence of ids into a sequence of nodes.
// Interprets any sequence that is itself an array a being a range (which is exactly what we indicating by our use of the `-` character).
let nodes = ids.map((id) => { if(Array.isArray(id) ? this.document.getRange(...id) : document.getElementById(id)});

*/
  }

  function parseReference(reference) {
    let chapter, section, subsection;
    let parts = reference.match(/([0-9a-zA-Z]+)/g);
    chapter = parts.shift();
    section = parts.shift();

    // Parse a range of subsections.
    // Parse a comma-delimitted series of subsections.
    //this.references = reference.split(",");
    subsection = parts.length > 0 ? parts.join("-") : null;
    return [chapter, section, subsection];
  }

  function replacer(match, p1, p2, offset, string, g) {
    // console.log(arguments);
    let length = arguments.length - 3;
    let memorized = Array.prototype.slice.call(arguments, length);
    let groups = memorized.pop();
    // console.log(groups);

    return this.replaceFn(groups);
  }



  function replaceWith(replacer) {
    this.replaceFn = replacer;
  }

  function parse(text) {
    let tmp = text;
    for (var regexp of this.patterns) {
      text = text.replaceAll(regexp, this.replacer.bind(this));
    }

    if (tmp == text) {
      console.log("No changes to node.");
    }

    return text;
  }

  

  function Matcher(patterns) {
    this.patterns = patterns;
    this.replaceFn = null;
  }


  Matcher.prototype = {
    replaceWith: replaceWith,
    parse: parse,
    replacer: replacer
  };

  function parseSubsections(reference) {
    let subs = reference.match(/(?<=\()([0-9a-zA-Z]+)(?=\))/g);

    console.log("parseSubsections()", subs);

    return subs;
  }

  Matcher.parseReference = parseReference;
  Matcher.parseSubsections = parseSubsections;
  Matcher.parseOrsReference = parseOrsReference;
  Matcher.parseReferences = parseReferences;
  window.Matcher = Matcher;
  return Matcher;
})();


export default Matcher;