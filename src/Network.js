import {OrsChapter} from "./chapter.js";

export { Network };

/**
 * Load a chapter of the Oregon Revised Statutes (ORS).
 * Example:
 *   let chapter = Network.loadOrs(810);
 */
const Network = (function () {
    const cache = {};


    // Gets the chapter from the cache
    function getCache(chapter) {
        return cache[chapter];
    }


    async function fetchOrs(chapterNum) {
        let chapter = getCache(chapterNum) || new OrsChapter(chapterNum);
        cache[chapterNum] = chapter;

        let doc = await chapter.load();

        if (!chapter.formatted) {
            chapter.parse();
            chapter.injectAnchors();
        }

        return chapter;
    }

    return {
        fetchOrs: fetchOrs,
        getCache: getCache
    };
})();