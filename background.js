// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log(request);
//   sendResponse({ farewell: "goodbye" });
// });

let customSlogans = [];

chrome.storage.sync.get("savedCustomSlogans", function(items) {
  customSlogans = items.savedCustomSlogans;
  updateUserBannedList("");
});

const userBannedSlogansList = document.getElementById("userBannedSlogansList");

const bannedSlogansList = document.getElementById("bannedSlogansList");
const page1 = document.getElementById("page1");
const page2btn = document.getElementById("s_page2");
const page1btn = document.getElementById("s_page1");
const container = document.getElementById("container");

const customSloganTextbox = document.getElementById("customSlogan");
const addSlogan = document.getElementById("add");

customSloganTextbox.onkeyup = () => {
  updateUserBannedList(customSloganTextbox.value);
};

addSlogan.onclick = () => {
  const customSlogan = customSloganTextbox.value;
  if (!customSlogans.includes(customSlogan)) {
    customSlogans.push(customSlogan);

    chrome.storage.sync.set({ savedCustomSlogans: customSlogans }, function() {
      updateUserBannedList(customSloganTextbox.value);
    });
  }
};

function updateUserBannedList(filter) {
  userBannedSlogansList.innerHTML = "";
  customSlogans.forEach((slogan, i) => {
    if (slogan.includes(filter)) {
      let sloganDOM = span(
        span(i + 1) + span(slogan) + button("removeSlogan-" + i, "-")
      );
      userBannedSlogansList.innerHTML += sloganDOM;
    }
  });
  setTimeout(() => {
    for (let i = 0; i < customSlogans.length; i++) {
      let button = document.getElementById("removeSlogan-" + i);
      button.name = i;
      button.addEventListener("click", e => {
        customSlogans.splice(i, 1);
        chrome.storage.sync.set(
          { savedCustomSlogans: customSlogans },
          function() {
            updateUserBannedList(customSloganTextbox.value);
          }
        );
      });
    }
  });
}

page2btn.onclick = () => {
  page1.style.marginLeft = "-400px";
};
page1btn.onclick = () => {
  page1.style.marginLeft = "0px";
};

function span(text) {
  return "<span>" + text + "</span>";
}
function button(id, text) {
  return "<button id = " + id + ">" + text + "</button>";
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
