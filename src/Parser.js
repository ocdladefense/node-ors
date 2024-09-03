/**
 * @class Parser
 * @description Parses ORS references in text and replaces them with links.
 * @example
 * let text = "ORS 123.123";
 * let linked = Parser.replaceAll(text);
 */
export const Parser = (function () {

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

    function Parser(patterns) {
        this.patterns = patterns;
        this.replaceFn = null;
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
            console.log('No changes to node.');
        }

        return text;
    }

    Parser.prototype = {
        replaceWith: replaceWith,
        parse: parse,
        replacer: replacer
    };



    function parseSubsections(reference) {
        let subs = reference.match(/(?<=\()([0-9a-zA-Z]+)(?=\))/g);

        console.log("parseSubsections()", subs);

        return subs;
    }


    
    Parser.parseReference = parseReference;
    Parser.parseSubsections = parseSubsections;

    return Parser;
})();