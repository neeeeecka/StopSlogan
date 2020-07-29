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

const customBanWord = document.getElementById("customBanWord");
const set = document.getElementById("set");

chrome.storage.sync.get("customBanWord", function(items) {
  customBanWord.placeholder = "Current: " + items.customBanWord;
});

set.onclick = () => {
  chrome.storage.sync.set({ customBanWord: customBanWord.value }, function() {
    customBanWord.placeholder = "Current: " + customBanWord.value;
    customBanWord.value = "";
  });
};

customSloganTextbox.onkeyup = e => {
  if (e.keyCode == 13) {
    addNew();
  } else {
    updateUserBannedList(customSloganTextbox.value);
  }
};

addSlogan.onclick = () => {
  addNew();
};

function addNew() {
  const customSlogan = customSloganTextbox.value.toLowerCase();
  if (!customSlogans.includes(customSlogan)) {
    customSlogans.push(customSlogan);

    chrome.storage.sync.set({ savedCustomSlogans: customSlogans }, function() {
      customSloganTextbox.value = "";
      updateUserBannedList("");
    });
  }
}

function updateUserBannedList(filter) {
  filter = filter.toLowerCase();

  if (customSlogans.length == 0) {
    userBannedSlogansList.innerHTML = fullDiv(
      "Type in word in the textbox and press '+' to add a new word"
    );
    return;
  }

  userBannedSlogansList.innerHTML = "";
  customSlogans.forEach((slogan, i) => {
    if (slogan.includes(filter)) {
      let sloganDOM = span(
        span(i + 1) +
          span(slogan) +
          button("removeSlogan-" + i, "<i class='minus' />")
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

function fullDiv(text) {
  return "<div class='fullDiv'>" + span(text) + "</div>";
}
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
      resultContent = fullDiv("Hooray, no banned words!");
    } else {
      response.forEach((slogan, i) => {
        resultContent += span(span(i + 1) + span(slogan));
      });
    }

    bannedSlogansList.innerHTML = resultContent;
  });
});
