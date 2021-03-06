import {OrsParser} from "./ors-parser.js";
export {OrsChapter};

/*let doc = load chapter from legislature Site
doc.findAndReplace() <-- links
doc.parse(html)
doc.getAll(sections)
doc.createTOC()
doc.injectAnchors()
doc.toString()
doc.getSection(sectionNum)
doc.highlight(sectionNum)
*/
//import ors parser functions


class OrsChapter{

    //class variables
    section;
    document;
    sectionTitles= {};
    sectionHeadings ={};

    OrsChapter(chapter){
        this.chapter = chapter;
    };

    //import ors parser functions here to find and replace links




    load() {
        return fetch("index.php?chapter=" + this.chapter +"&section=" +this.section)
            .then(function (resp) {
                return resp.arrayBuffer();
            })
            .then(function (buffer){
                const decoder = new TextDecoder("iso-8859-1");
                return decoder.decode(buffer);
            })
            .then(function (html){
                //initialize the parser
                const parser = new DOMParser();
                html = OrsParser.replaceAll(html);
                //tell the parser to look for html
                this.doc = parser.parseFromString(html, "text/html");
    
                
    
                //createa nodeList of all the <b> elements in the body
                let headings = this.doc.querySelectorAll("b");
                // console.log(headings);
                          
                
                
    
                for(var i = 0 ; i< headings.length; i++){
                    let boldParent = headings[i];            
                    var trimmed = headings[i].textContent.trim();
                    if(trimmed.indexOf("Note") === 0) continue;
                    let strings = trimmed.split("\n");
                    let chapter, section, key, val;
                    console.log(strings);
                    // if array has oonly one element,
                    // then we know this doesn't follow the traditional statute pattern.
                    if(strings.length === 1) {
                        key = strings[0];
                        val = boldParent.nextSibling ? boldParent.nextSibling.textContent : "";
                        
                    } else { // otherwise our normal case.
                        key = strings[0];
                        val = strings[1];
    
                        let numbers = key.split('.');
                        chapter = numbers[0];
                        section = numbers[1];
                    }
                    console.log(key);
                    this.sectionTitles[parseInt(section)] = val;
                    this.sectionHeadings[parseInt(section)] = boldParent;
                }
    
                // Inserts anchors as div tags in the doc.
                /*
                for(var prop in sectionTitles){
                    var headingDiv = doc.createElement('div');
                    headingDiv.setAttribute('id', prop);
                    headingDiv.setAttribute('class', 'ocdla-heading');
                    headingDiv.setAttribute('data-chapter', chapter);
                    headingDiv.setAttribute('data-section', prop);
    
                    let target = sectionHeadings[prop];
                    target.parentNode.insertBefore(headingDiv, target);
                }
                */
                // console.log(sectionTitles);
                // console.log(sectionHeadings);
               
                // chapter = parseInt(chapter);
                // section = parseInt(section);
                // highlight(chapter, section, null, doc);
                // Why does the range not work if called here?
    
                
    
                /*
                const serializer = new XMLSerializer();
                const subset = this.doc.querySelector(".WordSection1");
                return [this.sectionTitles, this.sectionHeadings, serializer.serializeToString(subset)];
                */
            });

            
    }

    toString(){
        const serializer = new XMLSerializer();
        const subset = this.doc.querySelector(".WordSection1");
        return serializer.serializeToString(subset);
    }

    injectAnchors(){
         // Inserts anchors as div tags in the doc.
         for(var prop in this.sectionTitles){
            var headingDiv = this.doc.createElement('div');
            headingDiv.setAttribute('id', prop);
            headingDiv.setAttribute('class', 'ocdla-heading');
            headingDiv.setAttribute('data-chapter', chapter);
            headingDiv.setAttribute('data-section', prop);

            let target = this.sectionHeadings[prop];
            target.parentNode.insertBefore(headingDiv, target);
        }
    }

    createToC(chapter, section) {
        modal.show();
        // Network call.
        let network = fetchOrs(chapter,section);
        let chapter = new OrsChapter(chapter);
        return network.then(function(data) {
            let sections,elements,html;
            [sections,elements,html] = data;
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
    
            let options = volumes.map(function(v,index){ return `<option value="${index+1}">Volume ${index+1} - ${v}</option>`});
            let optionsHtml = options.join("\n");
    
            let toc = [];
    
            for(let s in sections) {
                toc.push(`<li><a href="#${s}">${s} - ${sections[s]}</a></li>`);
            }
                /*
                    doc.findAndReplace() <-- links
                    doc.parse(html)
                    doc.getAll(sections)
                    doc.createTOC()
                    doc.injectAnchors()
                    doc.toString()
                    doc.getSection(sectionNum)
                    doc.highlight(sectionNum)
                */
            
            // highlight(chapter, section, null, doc);
            // Why does the range not work if called here?
    
            
            modal.renderHtml(html,"ors-statutes");
            modal.renderHtml(doc.toString(),"ors-statutes");
            modal.toc(toc.join("\n"));
            modal.titleBar("Oregon Revised Statutes - <select>"+optionsHtml+"</select><input type='checkbox' id='theHighlighter' name='highlighting' /><label for='theHighligher'>Highlight</label>");
            window.location.hash = section;
    
            var nextSection = getNextSection(section);
            console.log(nextSection);
            //good luck :^) goal: do highlighting at level of object
            //OrsParser.highlight(chapter,section,nextSection.dataset.section);
        });
    }


    highlight(section, endSection){
        console.log(chapter);
        console.log(section);
        console.log(endSection);
        let range = this.doc.createRange();
        
        
        var firstNode = this.doc.getElementById(section); 
        console.log(firstNode);
        var secondNode = this.doc.getElementById(endSection); 
        range.setStartBefore(firstNode);
        range.setEndBefore(secondNode);

        console.log(range);

        var newParent = this.doc.createElement('div');
        newParent.setAttribute('style', 'background-color:yellow;');
        range.surroundContents(newParent);
    }

    getNextSection(sectionNum){
        var headings = this.doc.querySelectorAll('.ocdla-heading');      
        var section = this.doc.getElementById(sectionNum);
           
        for(let i=0; i< headings.length; i++){
            if(headings.item(i) == section){
                let nextSection = headings.item(i+1);
                return nextSection;
            }
        }
    
    }
}