const body = document.body;

let bannedWord = "*Banned by StopSlogan*";
let parseWiki = true;
const slogans = {};
let slogansKeys = [];
const bannedSlogans = [];
const url =
  "https://en.wikipedia.org/w/api.php?" +
  new URLSearchParams({
    origin: "*",

    action: "parse",
    page: "List_of_political_slogans",
    format: "json"
  });

function chromeStorage(sKey) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(sKey, function(items) {
      console.log(items, sKey);
      resolve(items[sKey]);
    });
  });
}

chromeStorage("parseWiki")
  .then(result => {
    parseWiki = result;
    return chromeStorage("customBanWord");
  })
  .then(result => {
    bannedWord = result;
    return chromeStorage("savedCustomSlogans");
  })
  .then(result => {
    result.forEach(slogan => {
      slogansKeys.push(slogan);
      slogans[slogan] = true;
    });
    startScan();
  });

// chrome.storage.sync.get("parseWiki", function(items) {
//   parseWiki = items.parseWiki;
// });

// chrome.storage.sync.get("customBanWord", function(items) {
//   bannedWord = items.customBanWord;
// });

// chrome.storage.sync.get("savedCustomSlogans", function(items) {
//   items.savedCustomSlogans.forEach(slogan => {
//     slogansKeys.push(slogan);
//     slogans[slogan] = true;
//   });
// });

// const url = "https://en.wikipedia.org/wiki/List_of_political_slogans";

//en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=Most%20common%20words%20in%20Spanish'

function startScan() {
  function parseWikiNodes(startNode) {
    if (startNode.tagName == "LI") {
      const key = startNode.innerText.toLowerCase();
      slogans[key] = true;
      slogansKeys.push(key);
    }
    startNode.childNodes.forEach(node => {
      parseWikiNodes(node);
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

  if (parseWiki) {
    fetch(url)
      .then(response => response.json())
      .then(parsed => parsed.parse.text)
      .then(text => {
        const domParser = new DOMParser();
        let doc = domParser.parseFromString(text["*"], "text/html");
        parseWikiNodes(doc);
        checkNodeRecursively(body);
        const observer = new MutationObserver(callback);
        observer.observe(body, {
          childList: true,
          subtree: true
        });
      });
  } else {
    checkNodeRecursively(body);
  }
  function checkNode(startNode) {
    if (startNode.nodeType == Node.TEXT_NODE) {
      const value = startNode.nodeValue.toLowerCase();
      if (deepCheck(value)) {
        startNode.nodeValue = bannedWord;
        bannedSlogans.push(value);
      }
    } else {
      if (startNode.nodeType == Node.ELEMENT_NODE) {
        if (startNode.tagName == "INPUT" || startNode.tagName == "TEXTAREA") {
          const res = deepCheck(startNode.value);
          if (res) {
            startNode.value = res;
          }
        } else {
          if (startNode.childNodes.length == 0) {
            const res = deepCheck(startNode.value);
            if (res) {
              startNode.innerText = res;
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
      return bannedWord;
    }
    for (var i = 0; i < slogansKeys.length; i++) {
      const key = slogansKeys[i];
      if (text.includes(key)) {
        let edited = text.replace(key, bannedWord);
        return edited;
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
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "getBannedSlogans") {
    sendResponse(bannedSlogans);
  }
});
