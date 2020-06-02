(function(){
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  
  browser.pageAction.show();
})();