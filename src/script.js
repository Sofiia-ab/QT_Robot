
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■[ Global Declaration ]■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ //
// █                                                                                           █ //
// +-------------------------------------------------------------------------------------------+ //
//                                -  -- Block-Variables [$] --  -                                //
// +-------------------------------------------------------------------------------------------+ //
const $port = window.location.port;         // (Integer) -> port number the server is listening
const $url = `http://localhost:${$port}/`;  // (String)  -> website url root (for server requests)

// +-------------------------------------------------------------------------------------------+ //
//                                -  -- Block-Functions [$] --  -                                //
// +-------------------------------------------------------------------------------------------+ //

// +-------------------------------------------------------------------------------------------+ //
//                              -  -- Block-EventListener [$] --  -                              //
// +-------------------------------------------------------------------------------------------+ //

// █                                                                                           █ //
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ //


(() => {
  const QTfaces_path = './res/img/';
  const QTfaces_fileStart = '_QT-faces_';
  const QTfaces_ext = '.gif';

  const QTaudio_path = './res/voice/';
  const QTaudio_fileStart = 'audio_';
  const QTaudio_ext = '.mp3';

  const QTstories_path = './res/txt/';
  const QTstories_ext = '.txt';


  const qtFace = document.getElementById('qt-face');
  const playBtn = document.getElementById('play-button');
  const pauseBtn = document.getElementById('pause-button');
  const restartBtn = document.getElementById('restart-button');
  const storyContainer = document.getElementById('story-container');
  const storyAudio = new Audio();


  //let paused = false;
  let index = 0;
  let storyLines;
  let currentTimeout;
  let isplaying = false;
  let story;
  let emotionposList;
  let speed = 65;

  function getStory(story) {
    return QTstories_path + story + QTstories_ext;
  }

  function getQTfaceImg(emotion) {
    return QTfaces_path + QTfaces_fileStart + emotion + QTfaces_ext;
  }

  function changeEmotion(emotion) {
    qtFace.src = getQTfaceImg(emotion);
  }

  function clearStory() {
    storyContainer.innerText = '';
  }

  function getQTAudio(fileName) {
    return QTaudio_path + QTaudio_fileStart + fileName + QTaudio_ext;
  }

  async function loadStory() {
    story = storySelector.value;
    const response = await fetch(getStory(story));
    const text = await response.text();
    index = 0;
    storyLines = text;
    isplaying = false;
    console.log(storyLines);
    getEmotionPosInText();
    return storyLines;
  }

  function getEmotionPosInText() {
    let s = storyLines;
    let emopos = s.indexOf('[');
    emotionposList = {};
    while (emopos != -1) {
      let emotion = s.substring(emopos+1,s.indexOf(']',emopos));
      emotionposList[emopos]=emotion;
      emopos = s.indexOf('[',emopos+1);
    }
    console.log(emotionposList);
  }

  async function playStory() {
    if (isplaying || storyLines.length === 0) return;
    isplaying = true;
    changeEmotion('talking');
    storyAudio.play();
    //displayNextCharacter();
    //isplaying = false;

    function displayNextCharacter() {
      if(!isplaying || index >= storyLines.length) {
        isplaying = false;
        return;
      }
      let emotion = emotionposList[index+30];
      if (emotion)
        setTimeout(() => {changeEmotion(emotion)}, 1500);
      if (emotionposList[index]) index+=emotionposList[index].length+1;
      else storyContainer.innerText += storyLines[index];
      storyContainer.scrollTop = storyContainer.scrollHeight;
      index++;
      setTimeout(displayNextCharacter, speed);
    }
    displayNextCharacter();
  }



/*
  async function playStory(fileName) {
    if (processing) return;
    processing = true;

    // Load story only once
    if (storyLines.length === 0) {
      storyLines = await loadStory(fileName);
    }

    function displayNextSentence() {
      if (paused || index >= storyLines.length) {
        processing = false;
        return;
      }

      const text = storyLines[index];
      const parts = text.split(/(\[.*?\])/g).filter(Boolean);

      let partIndex = 0;

      function processParts() {
        if (paused || partIndex >= parts.length) {
          index++;
          currentTimeout = setTimeout(displayNextSentence, 1000);
          return;
        }

        const part = parts[partIndex];
        const emotionMatch = part.match(/\[(.*?)\]/);

        if (emotionMatch) {
          changeEmotion(emotionMatch[1]);
          partIndex++;
          currentTimeout = setTimeout(processParts, 50); // Attend 1.5 sec pour laisser l'émotion
        } else {
          storyContainer.innerText = part;
          partIndex++;
          currentTimeout = setTimeout(processParts, 3000); // Attend 3 sec pour lire le texte
        }
      }

      processParts();
    }

    displayNextSentence();
  }

  playBtn.onclick = async () => {
    if (paused) {
      paused = false;
      storyAudio.play();
    } else if (!processing) {
      paused = false;
      index = 0;
      storyLines = [];
      clearStory();
      storyAudio.src = getQTAudio("Histoire");
      storyAudio.currentTime = 0;
      storyAudio.play();
    }
    await playStory("Histoire");
  };
  

  pauseBtn.onclick = () => {
    paused = true;
    storyAudio.pause();
    clearTimeout(currentTimeout);
  };*/

  playBtn.onclick = async () => {
    await playStory();
  }

  pauseBtn.onclick = () => {
    isplaying = false;
    storyAudio.pause();
    clearTimeout(currentTimeout);
    changeEmotion('neutral_state_blinking');
  };

  restartBtn.onclick = async () => {
    isplaying = false;
    clearStory();
    clearTimeout(currentTimeout);
    storyAudio.currentTime = 0;
    index = 0;
    await playStory();
  }

  storySelector.onchange = () => {
    isplaying = false;
    clearStory();
    loadStory();
    storyAudio.src = getQTAudio(story);
    storyAudio.currentTime = 0;
  };
  
})();
