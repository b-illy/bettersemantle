// ==UserScript==
// @name           Better Semantle
// @description    allows you to play unlimited random words instead of just one a day
// @author         billy
// @version        2.0
// @match          https://semantle.novalis.org/*
// @grant          none
// ==/UserScript==

let payload = async () => {
  setTimeout(async () => {
    // local storage handling
    let storage = window.localStorage;
    
    if (!(storage.getItem("random") == "0" || storage.getItem("random") == "1")) {
      storage.setItem("random", "0"); // set to daily (false/off/0) by default
    }
    
    let random = false;
    if (storage.getItem("random") == "1") random = true;
    

    // copied from semantle src - gets scores of 1st, 10th, 1000th nearest words
    let getSimilarityStory = async (secret) => {
      const url = "/similarity/" + secret;
      const response = await fetch(url);
      try {
        return await response.json();
      } catch (e) {
        return null;
      }
    }
    
    let changeWord = (r) => {
      // clear guesses
      storage.removeItem("guesses");
      storage.removeItem("winState");
      storage.removeItem("currentWord");

      // toggle on "random" variable
      storage.setItem("random", r);

      // reload page
      window.location.reload();
    }
    
    const simStory = document.getElementById("similarity-story");
    
    let dailyBtn = document.createElement("button");
    dailyBtn.innerHTML = "Go back to daily word";
    dailyBtn.onclick = (e) => { changeWord("0"); }
    
    let changeWordBtn = document.createElement("button");
    changeWordBtn.innerHTML = "Play a new random word";
    changeWordBtn.onclick = (e) => { changeWord("1"); }
    
    
    // update daily word info text
    if (random) {
      // change secret word to a random one (if none stored)
      if (storage.getItem("currentWord")) {
        secret = storage.getItem("currentWord");
      } else {
        secret = secretWords[Math.floor(Math.random() * secretWords.length)];
        storage.setItem("currentWord", secret);
      }
      
      // update similarity story
      similarityStory = await getSimilarityStory(secret);
      simStory.innerHTML = `The nearest word has a similarity of <b>${(similarityStory.top * 100).toFixed(2)}</b>, the tenth-nearest has a similarity of ${(similarityStory.top10 * 100).toFixed(2)} and the one thousandth nearest word has a similarity of ${(similarityStory.rest * 100).toFixed(2)}.`;
      simStory.innerHTML += "<br>(This secret word was randomised.)";
      
      // add daily/random toggle
      
      simStory.parentNode.insertBefore(dailyBtn, simStory.nextSibling);
      simStory.parentNode.insertBefore(changeWordBtn, simStory.nextSibling);
      changeWordBtn.after(" ");
    } else {
      simStory.parentNode.insertBefore(changeWordBtn, simStory.nextSibling);
    }
  }, 1000);
}


let inject = (func) => {
  let source = func.toString();
  let script = document.createElement("script");
  script.innerHTML = "(" + source + ")()";
  document.body.appendChild(script);
}


inject(payload);
