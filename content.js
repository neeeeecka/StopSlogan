const body = document.body;

const bannedWord = "*Banned by StopSlogan*";

const slogans = {};
let slogansKeys = [];
const bannedSlogans = [];

chrome.storage.sync.get("savedCustomSlogans", function(items) {
  items.savedCustomSlogans.forEach(slogan => {
    slogansKeys.push(slogan);
    slogans[slogan] = true;
  });
});

// const url = "https://en.wikipedia.org/wiki/List_of_political_slogans";
const url =
  "https://en.wikipedia.org/w/api.php?" +
  new URLSearchParams({
    origin: "*",

    action: "parse",
    page: "List_of_political_slogans",
    format: "json"
  });
//en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=Most%20common%20words%20in%20Spanish'

function parseNode(startNode) {
  if (startNode.tagName == "LI") {
    const key = startNode.innerText.toLowerCase();
    slogans[key] = true;
    slogansKeys.push(key);
  }
  startNode.childNodes.forEach(node => {
    parseNode(node);
  });
}

const callback = function(mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      const node = mutation.target;
      checkNodeRecursively(node);
    }
  }
};

fetch(url)
  .then(response => response.json())
  .then(parsed => parsed.parse.text)
  .then(text => {
    const domParser = new DOMParser();
    let doc = domParser.parseFromString(text["*"], "text/html");
    parseNode(doc);
    checkNodeRecursively(body);
    const observer = new MutationObserver(callback);
    observer.observe(body, {
      childList: true,
      subtree: true
    });
  });

function checkNode(startNode) {
  if (startNode.nodeType == Node.TEXT_NODE) {
    const value = startNode.nodeValue.toLowerCase();
    if (deepCheck(value)) {
      startNode.nodeValue = "*Banned by StopSlogan*";
      bannedSlogans.push(value);
    }
  } else {
    if (startNode.nodeType == Node.ELEMENT_NODE) {
      if (startNode.tagName == "INPUT" || startNode.tagName == "TEXTAREA") {
        if (deepCheck(startNode.value)) {
          startNode.value = bannedWord;
        }
      } else {
        if (startNode.childNodes.length == 0) {
          if (deepCheck(startNode.innerText)) {
            startNode.innerText = bannedWord;
          }
        }
      }
    }
  }
}

function deepCheck(text) {
  if (text == bannedWord || !text) {
    return false;
  }
  text = text.toLowerCase();

  if (slogans[text]) {
    return true;
  }
  for (var i = 0; i < slogansKeys.length; i++) {
    const key = slogansKeys[i];
    if (text.includes(key)) {
      return true;
    }
  }
  return false;
  //TODO: Levenshtein Distance Algorithm
}

function checkNodeRecursively(startNode) {
  checkNode(startNode);

  startNode.childNodes.forEach(node => {
    checkNodeRecursively(node);
  });
}
// chrome.runtime.sendMessage(bannedSlogans, function (response) {
//     console.log(response.farewell);
// });
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "getBannedSlogans") {
    sendResponse(bannedSlogans);
  }
});
