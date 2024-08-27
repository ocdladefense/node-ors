/**
 * @class Parser
 * @description Parses ORS references in text and replaces them with links.
 * @example
 * let text = "ORS 123.123";
 * let linked = Parser.replaceAll(text);
 */
const Parser = (function () {
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

    function createDocumentFragment(html) {
        const parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        let fragment = new DocumentFragment();
        fragment.append(doc.documentElement);

        return fragment;
    }

    Parser.createDocumentFragment = createDocumentFragment;

    return Parser;
})();

export default Parser;
