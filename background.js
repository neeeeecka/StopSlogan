// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log(request);
//   sendResponse({ farewell: "goodbye" });
// });

const bannedSlogansList = document.getElementById("bannedSlogansList");
const page1 = document.getElementById("page1");
const page2btn = document.getElementById("s_page2");
const page1btn = document.getElementById("s_page1");
const container = document.getElementById("container");

page2btn.onclick = () => {
  page1.style.marginLeft = "-400px";
};
page1btn.onclick = () => {
  page1.style.marginLeft = "0px";
};

function span(text) {
  return "<span>" + text + "</span>";
}

//get banned slogans
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { action: "getBannedSlogans" }, function(
    response
  ) {
    let resultContent = "";

    if (response.length == 0) {
      resultContent = span("Hooray, no banned words!");
    } else {
      response.forEach((slogan, i) => {
        resultContent += span(span(i) + span(slogan));
      });
    }

    bannedSlogansList.innerHTML = resultContent;
  });
});
