

export default class ChapterInitPhases {


      // Locate all of the document's section titles (usually in <b> tags) and store the text in an array for future use.
      static INIT_SECTION_TITLES = 0

      // Do the same with references to the <b> elements themselves.
      static INIT_SECTION_TITLE_NODES = 1;

      // Add anchor nodes to the document to allow for easy linking to sections.
      static INSERT_SECTION_ANCHOR_NODES = 2;

      // Wrap each section in a container node.
      static INSERT_SECTIONS = 3

      // Do the same for subsections, and their own subsections.
      static INSERT_SECTIONS_RECURSIVE = 4;
}