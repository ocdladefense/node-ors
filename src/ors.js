export {Ors};

const Ors = (function() {//Creates the scrollable table of contents on the big modal


    //Creates the list of volumes in the dropdown selector on the big modal
    function buildVolumes() {
        //Need to replace this array with a dynamically generated list
        let volumes = ["Courts, Or. Rules of Civil Procedure",
            "Business Organizations, Commercial Code",
            "Landlord-Tenant, Domestic Relations, Probate",
            "Criminal Procedure, Crimes",
            "State Government, Government Procedures, Land Use",
            "Local Government, Pub. Employees, Elections",
            "Pub. Facilities & Finance",
            "Revenue & Taxation",
            "Education & Culture",
            "Highways, Military",
            "Juvenile Code, Human Services",
            "Pub. Health",
            "Housing, Environment",
            "Drugs & Alcohol, Fire Protection, Natural Resources",
            "Water Resources, Agriculture & Food",
            "Trade Practices, Labor & Employment",
            "Occupations",
            "Financial Institutions, Insurance",
            "Utilities, Vehicle Code, Watercraft, Aviation, Constitutions"];

        let options = volumes.map(function (v, index) { return `<option id="${index + 1}" value="${index + 1}">Volume ${index + 1} - ${v}</option>` });
        this.volumeNames = options;
        let optionsHtml = options.join("\n");

        return `<select id='dropdown'>` + optionsHtml + `</select>`;
    }


    // Loads the XML file containing the names of all Volumes, Titles, and Chapters
    async function loadXml(volumeNumber) {
        if (this.loadedXml) { return Promise.resolve(true); }

        let url = "ors.xml"
        fetch(url)
        .then(response => response.text())
        .then(data => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(data, "application/xml");
            this.xml = xmlDoc;
            console.log(xml);
            //currently we are hardcoading the volume number, this will eventually
            //be replaced by a variable linked to a change event 
            //on the volume dropdown selector in the big modal
            /*
            var volumeNumber = "1";
            console.log(volumeNumber);
            this.getChaptersByVolume(xml, volumeNumber);
            */
            this.loadXml = true;
        });
    }


    //Returns a list of chapters as links based on the selected volume
    function getChaptersByVolume(volumeNumber) {
        //currently we are hardcoading the volume number, this will eventually
        //be replaced by a variable linked to a change event 
        //on the volume dropdown selector in the big modal
        var volumeNumber = "1";

        let chapters = this.xml.querySelectorAll("#vol-" + volumeNumber + " chapter");
        console.log(chapters);
        let links = [];

        for (var i = 0; i < chapters.length; i++) {
            let chapter = chapters[i];
            var parts = chapter.id.split("-");
            let chapterNum = parts[1];
            let chapterName = chapter.innerText;
            let link = `<a href="#" data-action="show-ors" data-chapter="${chapterNum}" data-section="1">${chapterName}</a>`;
            links.push(link);
        }

        console.log(links);
        return links.join("\n");
    }

    return {
        getChaptersByVolume, buildVolumes, loadXml
    };
})();