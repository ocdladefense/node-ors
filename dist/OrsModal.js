/*

modal.renderHtml("<h1>Hello World!</h1>");
modal.show();

*/
export { OrsModal };
var OrsModal = function () {
  var proto = {
    show: function show() {
      $('body').addClass("has-modal");
      $("body").addClass("loading");
      setTimeout(function () {
        return $("#modal").addClass("fullscreen");
      }, 100);
    },
    hide: function hide() {
      $("#modal").removeClass("fullscreen");
      setTimeout(function () {
        return $('body').removeClass('has-modal');
      }, 100);
    },
    render: function render(vNode) {
      document.getElementById('modal-content').innerHTML = "";
      document.getElementById('modal-content').appendChild(createElement(vNode));
    },
    renderHtml: function renderHtml(html, targetId) {
      $("body").removeClass("loading");
      document.getElementById(targetId || "modal-content").innerHTML = html;
    },
    titleBar: function titleBar(html) {
      document.getElementById("modal-title-bar-content").innerHTML = html;
      var selector = document.getElementById("dropdown");
      selector.addEventListener("change", function () {
        console.log("Dropdown Selected");
      });
      var closeBtn = document.getElementById("close-modal");
      closeBtn.addEventListener("click", function () {
        modal.hide();
      });
    },
    toc: function toc(html) {
      document.getElementById("ors-toc").innerHTML = html;
    },
    html: function html(_html) {
      this.renderHtml(_html);
    }
  };
  function OrsModal() {}
  OrsModal.prototype = proto;
  return OrsModal;
}();