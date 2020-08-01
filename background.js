// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log(request);
//   sendResponse({ farewell: "goodbye" });
// });

let customSlogans = [];

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

const parseWiki = document.getElementById("parseWiki");

function sleep(seconds) {
  var e = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() <= e) {}
}

chrome.storage.sync.get("savedCustomSlogans", function(items) {
  if (items.savedCustomSlogans) {
    customSlogans = items.savedCustomSlogans;

    // updateUserBannedList("");
  }
});

parseWiki.onchange = () => {
  chrome.storage.sync.set({ parseWiki: parseWiki.checked }, function() {});
};

chrome.storage.sync.get("customBanWord", function(items) {
  if (items.customBanWord) {
    customBanWord.placeholder = "Current: " + items.customBanWord;
  }
});
chrome.storage.sync.get("parseWiki", function(items) {
  if (items.parseWiki != undefined) {
    parseWiki.checked = items.parseWiki;
  }
});

set.onclick = () => {
  saveNewBanWord();
};

customBanWord.onkeyup = e => {
  if (e.keyCode == 13) {
    saveNewBanWord();
  }
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

function saveNewBanWord() {
  chrome.storage.sync.set({ customBanWord: customBanWord.value }, function() {
    customBanWord.placeholder = "Current: " + customBanWord.value;
    customBanWord.value = "";
  });
}

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

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

//get banned slogans
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { action: "getBannedSlogans" }, function(
    response
  ) {
    if (response) {
      let resultContent = "";

      if (response.length == 0) {
        resultContent = fullDiv("Hooray, no banned words!");
      } else {
        response.forEach((slogan, i) => {
          resultContent += span(span(i + 1) + span(escapeHtml(slogan)));
        });
      }

      bannedSlogansList.innerHTML = resultContent;
    }
  });
});
