function highlight(chapter, section, endSection, doc = null) {
    console.log(chapter);
    console.log(section);
    console.log(endSection);
    let range = doc ? doc.createRange() : new Range();
    doc = doc || document;

    //endSection = endSection || (section + 1);

    //section = padZeros(section);
    //endSection = padZeros(endSection);
    //console.log(section,endSection);

    //var start = chapter + '.' + section;
    //var end = chapter + '.' + endSection;

    //console.log(start,end);

    var firstNode = doc.getElementById(section);
    console.log(firstNode);
    var secondNode = doc.getElementById(endSection);
    range.setStartBefore(firstNode);
    range.setEndBefore(secondNode);

    console.log(range);

    var newParent = doc.createElement('div');
    newParent.setAttribute('style', 'background-color:yellow;');
    range.surroundContents(newParent);
}



    // Highlights a selected section on the page
    highlight(section, endSection) {
        console.log(this.chapterNum);
        console.log(section);
        console.log(endSection);
        let range = this.doc.createRange();

        var firstNode = this.doc.getElementById(section);
        console.log(firstNode);
        var secondNode = this.doc.getElementById(endSection);
        console.log(secondNode);
        range.setStartBefore(firstNode);
        range.setEnd(
            secondNode.parentNode,
            secondNode.parentNode.childNodes.length
        );

        console.log(range);

        var newParent = this.doc.createElement('div');
        newParent.setAttribute('style', 'background-color:yellow;');

        var contents = range.extractContents();
        console.log(contents);
    }
