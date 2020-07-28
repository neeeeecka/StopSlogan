// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log(request);
//   sendResponse({ farewell: "goodbye" });
// });

const bannedSlogansList = document.getElementById("bannedSlogansList");

function span(text) {
  return "<span>" + text + "</span>";
}

//get banned slogans
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { action: "getBannedSlogans" }, function(
    response
  ) {
    const resultContent = "";

    if (response.length == 0) {
      resultContent = span("Hooray, no banned words!");
    } else {
      response.forEach(slogan => {
        resultContent += span(slogan);
      });
    }
  });
});
