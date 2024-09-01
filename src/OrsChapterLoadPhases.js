

export default class OrsChapterLoadPhases {


              // Locate all of the document's section titles (usually in <b> tags) and store the text in an array for future use.
    static LOAD_SECTION_TITLES = 0
          
          // Do the same with references to the <b> elements themselves.
    static LOAD_SECTION_TITLE_NODES = 1;
          
          // Add anchor nodes to the document to allow for easy linking to sections.
    static ADD_SECTION_ANCHOR_NODES = 2;
          
          // Wrap each section in a container node.
    static WRAP_SECTIONS = 3
          
          // Do the same for subsections, and their own subsections.
    static WRAP_SECTIONS_RECURSIVE = 4;
}