import {OrsChapter} from "./chapter.js";
import {Http} from "../../lib-http/src/http.js";



/**
 * Load a chapter of the Oregon Revised Statutes (ORS).
 * Example:
 *   let chapter = Network.loadOrs(810);
 */
const Network = (function () {
    const cache = {};

    let networkUrl = null;


    // Gets the chapter from the cache
    function getCache(params) {
        return cache[params.chapter];
    }

    function setCache(params, value) {
        cache[params.chapter] = value;
    }

    function setUrl(url) {
        networkUrl = url;
    }


    async function fetchOrs(params) {



        let chapter = getCache(params);
        
        if(null == chapter) {
            chapter = new OrsChapter(params.chapter);
            let url = networkUrl + "?" + Http.formatQueryString(params);

            let resp = await fetch(url);

            setCache(params, chapter);

            let doc = await chapter.load(resp);
        }

        if (!chapter.formatted) {
            chapter.parse();
            chapter.injectAnchors();
        }

        return chapter;
    }

    return {
        fetchOrs: fetchOrs,
        getCache: getCache,
        setUrl: setUrl
    };
})();



export default Network;