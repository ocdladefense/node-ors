/*

modal.renderHtml("<h1>Hello World!</h1>");
modal.show();

*/
var modal = {
  show: function () {
    $('body').addClass("has-modal");
    $("body").addClass("loading");
    setTimeout(() => $("#modal").addClass("fullscreen"), 100);
  },
  hide: function () {
    $("#modal").removeClass("fullscreen");
    setTimeout(() => $('body').removeClass('has-modal'), 100);
  },
  render: function (vNode) {
    document.getElementById('modal-content').innerHTML = "";
    document.getElementById('modal-content').appendChild(createElement(vNode));
  },
  renderHtml: function (html, targetId) {
    $("body").removeClass("loading");
    document.getElementById(targetId || "modal-content").innerHTML = html;
  },
  titleBar: function (html) {
    document.getElementById("modal-title-bar").innerHTML = html;
  },
  toc: function (html) {
    document.getElementById("ors-toc").innerHTML = html;
  },
  html: function (html) {
    this.renderHtml(html);
  }
};