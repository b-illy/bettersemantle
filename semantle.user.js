// ==UserScript==
// @name           Better Semantle
// @description    allows you to play unlimited random words instead of just one a day
// @author         billy
// @version        2.0.3
// @match          https://semantle.novalis.org/*
// @match          https://semantle.com/*
// @match          https://legacy.semantle.com/*
// @downloadURL    https://b-illy.github.io/bettersemantle/semantle.user.js
// @updateURL      https://b-illy.github.io/bettersemantle/semantle.user.js
// @grant          none
// ==/UserScript==

let payload = async () => {
  setTimeout(async () => {
    // local storage handling
    const storage = window.localStorage; // easier to type, lazy shortcut
    
    if (!(storage.getItem("random") == "0" || storage.getItem("random") == "1")) {
      storage.setItem("random", "0"); // set to daily (false/off/0) by default
    }
    
    // set this bool according to local storage
    let random = false;
    if (storage.getItem("random") == "1") random = true;
    

    // basically copied from semantle src - gets scores of 1st, 10th, 1000th nearest words
    let getSimilarityStory = async (secret) => {
      const url = "/similarity/" + secret;
      const response = await fetch(url);
      try {
        return await response.json();
      } catch (e) {
        return null;
      }
    }
    
    const changeWord = (r) => {
      // clear guesses
      storage.removeItem("guesses");
      storage.removeItem("winState");
      storage.removeItem("currentWord");

      // set "random" toggle to whatever parameter was given
      storage.setItem("random", r);

      // reload page (required to update page after clearing guesses)
      window.location.reload();
    }
    
    const simStory = document.getElementById("similarity-story");
    
    let dailyBtn = document.createElement("button");
    dailyBtn.innerHTML = "Go back to daily word";
    dailyBtn.onclick = (e) => { changeWord("0"); } // set to daily word
    
    let changeWordBtn = document.createElement("button");
    changeWordBtn.innerHTML = "Play a new random word";
    changeWordBtn.onclick = (e) => { changeWord("1"); } // set to new random word
    
    
    // update daily word info ("similarity story") text and add buttons
    if (random) {
      // change secret word to a random one (if none stored)
      if (storage.getItem("currentWord")) {
        secret = storage.getItem("currentWord");
      } else {
        secret = secretWords[Math.floor(Math.random() * secretWords.length)];
        storage.setItem("currentWord", secret);
      }
      
      // update similarity story for current word (rather than the daily)
      similarityStory = await getSimilarityStory(secret);
      simStory.innerHTML = `The nearest word has a similarity of <b>${(similarityStory.top * 100).toFixed(2)}</b>, the tenth-nearest has a similarity of ${(similarityStory.top10 * 100).toFixed(2)} and the one thousandth nearest word has a similarity of ${(similarityStory.rest * 100).toFixed(2)}.`;
      simStory.innerHTML += "<br>(This secret word was randomised.)";
      
      // add "back to daily" button
      simStory.parentNode.insertBefore(dailyBtn, simStory.nextSibling);
      // add "new random word" button (BEFORE "back to daily")
      simStory.parentNode.insertBefore(changeWordBtn, simStory.nextSibling);
      changeWordBtn.after(" "); // (add whitespace between the buttons)
    } else {
      // add "new random word" button only
      simStory.parentNode.insertBefore(changeWordBtn, simStory.nextSibling);
    }
  }, 1000); // execute after 1s to make sure main semantle js has executed first, a bit hacky
}


// adds a function to the page in a new script tag
const inject = (func) => {
  let source = func.toString();
  let script = document.createElement("script");
  script.innerHTML = "(" + source + ")()";
  document.body.appendChild(script);
}


inject(payload);
