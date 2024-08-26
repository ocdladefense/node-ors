/**
 * @class Parser
 * @description Parses ORS references in text and replaces them with links.
 * @example
 * let text = "ORS 123.123";
 * let linked = Parser.replaceAll(text);
 */
const Parser = (function () {
    let proto = {};

    const patterns = [
        /ORS\s+(?<chapter>\d+)\.(?<section>\d+)(?:\s?\((?<subsection>[0-9a-zA-Z]{1,3})\))*/g,
        /(?:\d{4}\s)*c\.(?<chapter>\d+)\s+§+(?<section>\d+,*\s?)+/g,
        /(?<!ORS\s+\d*)(?<chapter>\d+)\.(?<section>\d+)(?:\s?\((?<subsection>[0-9a-zA-Z]{1,3})\))*/g
    ];

    let replacer = function (match, p1, p2, offset, string, g) {
        // console.log(arguments);
        let length = arguments.length - 3;
        let memorized = Array.prototype.slice.call(arguments, length);
        let groups = memorized.pop();
        // console.log(groups);
        let subsection = groups.subsection ? `(${groups.subsection})` : '';

        let link = `<a href="#" style="color:blue;" data-action="show-ors" data-chapter="${groups.chapter}" data-section="${groups.section}" data-subsection="${subsection}">ORS ${groups.chapter}.${groups.section}${subsection}</a>`;

        return link;
    };

    function replaceAll(text) {
        for (var regexp of patterns) {
            text = text.replaceAll(regexp, replacer);
        }

        return text;
    }

    function padZeros(section) {
        if (section < 10) {
            return '00' + section;
        }
        if (section < 100) {
            return '0' + section;
        }

        return '' + section;
    }

    function Parser() {}

    Parser.prototype = proto;
    Parser.replaceAll = replaceAll;
    Parser.padZeros = padZeros;

    return Parser;
})();

export default Parser;
