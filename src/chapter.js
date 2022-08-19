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

    constructor(chapter){
        this.chapter = chapter;
    }

   

    async load() {
        return fetch("index.php?chapter=" + this.chapter)
            .then(function (resp) {
                return resp.arrayBuffer();
            })
            .then(function (buffer){
                const decoder = new TextDecoder("iso-8859-1");
                return decoder.decode(buffer);
            })
            .then( (html) => {
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
                    //console.log(strings);
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
                    //console.log(key);

                    //might need to change this one to remove parseInt
                    this.sectionTitles[parseInt(section)] = val;
                    this.sectionHeadings[parseInt(section)] = boldParent;
                }
    
               
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
            headingDiv.setAttribute('data-chapter', this.chapter);
            headingDiv.setAttribute('data-section', prop);

            let target = this.sectionHeadings[prop];
            target.parentNode.insertBefore(headingDiv, target);
        }
    }

    
    buildToC(){
        
        console.log(this.sectionTitles);
        let toc = [];
             
        for(let key in this.sectionTitles) {
            let val = this.sectionTitles[key];
            
            

             toc.push(`<li><a href="#${key}">${key} - ${val}</a></li>`);
        } 
        console.log(toc);
        var joinedToc = toc.join(' ');

        return joinedToc;
    }

    createToC() {
        modal.show();
        // Network call.
        let network = load(this.chapter,this.section);
        let chapter = new OrsChapter(this.chapter);
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
               
          
    
            window.location.hash = this.section;   
            var nextSection = getNextSection(this.section);
            console.log(nextSection);
            //good luck :^) goal: do highlighting at level of object
            //OrsParser.highlight(chapter,section,nextSection.dataset.section);
        });
    }


    highlight(section, endSection){
        console.log(this.chapter);
        console.log(section);
        console.log(endSection);
        let range = this.doc.createRange();
        
        
        var firstNode = this.doc.getElementById(section); 
        console.log(firstNode);
        var secondNode = this.doc.getElementById(endSection); 
        console.log(secondNode);
        range.setStartBefore(firstNode);
        range.setEnd(secondNode.parentNode, secondNode.parentNode.childNodes.length);

        //let nextParagraph = firstNode.parentNode.nextSibling.nextSibling;
        //range.setEnd(nextParagraph, nextParagraph.childNodes.length);

        console.log(range);

        var newParent = this.doc.createElement('div');
        newParent.setAttribute('style', 'background-color:yellow;');
        //range.surroundContents(newParent);
        var contents = range.extractContents();
        console.log(contents);
    }

    extractContents(sectionNumber){
        let range = this.doc.createRange();
        
        
        var firstNode = this.doc.getElementById(sectionNumber); 
        console.log(firstNode);
        var secondNode = this.doc.getElementById(endSection); 
        console.log(secondNode);
        range.setStartBefore(firstNode);
        range.setEndBefore(secondNode);

        console.log(range);

        
        var contents = range.extractContents();
        console.log(contents);

        return contents;
    }


    getSection(section){
        //do we want to do sections inside this class? or do them in their own class?
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