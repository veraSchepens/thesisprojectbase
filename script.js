const chatInput = 
    document.querySelector('.chat-input textarea');

const sendChatBtn = 
    document.querySelector('.chat-input button');

let userMessage;
const API_KEY = 
    "tgp_v1_MQ2adXCZV21rs4UY5zIylzdzQeUB3gc6Bzf75bwPYkw";

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent;
    if (className === "chat-outgoing") {
        classContent = `<p class ="outgoing-message">${message}</p>`;
 } else {
        chatContent =  `<p class= "incoming-message">${message}</p>`;
    }
    chatLi.innerHTML = chatContent;
    return chatLi;
}

const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.together.xyz/v1/chat/completions";
    const messageElement = incomingChatLi
    .querySelector("p");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            "messages": [
                {
                    role: "user",
                    content: "Beantwoord dit in maximaal 200 woorden" + userMessage
                }
            ],
        })
    };

    fetch(API_URL, requestOptions)
        .then(res => {
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        })

        .then(data => {
            console.log(data);
            const responseText = data.choices[0].message.content;
            messageElement.textContent = responseText;

            const speakText = (text) => {
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = speechSynthesis.getVoices();
                const dutchVoice = voices.find(voice=> voice.name === "Google Nederlands");

                if (dutchVoice){
                    utterance.voice = dutchVoice;
                } else {
                    console.warn("Google Nederlands stem niet gevonden, gebruik standaardstem.")
                }

                utterance.lang = "nl-NL"
                speechSynthesis.speak(utterance);
            }

            speakText(responseText);
            startDynamicEyeBehavior();

            // // 1. Estimate reading time
            // const wordCount = responseText.split(/\s+/).length;
            // const wordsPerMinute = 244;
            // const readingTimeMs = (wordCount / wordsPerMinute) * 60 * 1000;

            // // 2. Randomize eye movement during reading
            // const randomInterval = setInterval(() => {
            //     const randomChoice = Math.random() < 0.5 ? neutral_frames : thinking_frames;
            //     setEyeAnimation(randomChoice);
            // }, 2500); // switch every 2.5s during reading

            // // 3. At the end of reading, go back to neutral and stop random eyes
            // setTimeout(() => {
            //     clearInterval(randomInterval);
            //     setEyeAnimation(neutral_frames);
            // }, readingTimeMs);
        })

        .catch(() => {
            messageElement.classList.add("error");
            const utterance = new SpeechSynthesisUtterance("Er is iets misgegaan. Probeer het opnieuw.")
            speechSynthesis.speak(utterance);
        })

        .finally(() => {
            setEyeAnimation(neutral_frames);
        })
};

function chooseRandomGaze(framesA, framesB) {
  const chosenFrames = Math.random() < 0.5 ? framesA : framesB;
  setEyeAnimation(chosenFrames);
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    chatInput.value = "";

    chooseRandomGaze(LU1_frames, RU1_frames);

    if(!userMessage){
        return;
    }

    if (userMessage.toLowerCase()==="bye"){
        cancel();
        return;
    }

    const incomingChatLi = createChatLi("...","chat-incoming");
    generateResponse(incomingChatLi);

    setTimeout(() => {
        setEyeAnimation(neutral_frames);
    }, 2200);
}
sendChatBtn.addEventListener("click", handleChat);

const neutral_frames = [
    { src: "Assets/eyes_open.png", duration: 1920 }];

const LU1_frames = [
    { src: "Assets/eyes_LU1.png", duration: 1920 }]

const RU1_frames = [
    { src: "Assets/eyes_RU1.png", duration: 1920 }]

const L1_frames = [
    { src: "Assets/eyes_L1.png", duration: 1920 }]

const R1_frames = [
    { src: "Assets/eyes_R1.png", duration: 1920 }]

const R2_frames = [
    { src: "Assets/eyes_R2.png", duration: 1920 }]

const L2_frames = [
    { src: "Assets/eyes_L2.png", duration: 1920 }]
  
function blink() {
  const image = document.getElementById("displayed-image");
  const originalSrc = image.src;

  setTimeout(() => image.src = "Assets/eyes_half_closed.png", 10);
  setTimeout(() => image.src = "Assets/eyes_closed.png", 80);
  setTimeout(() => image.src = "Assets/eyes_half_closed.png", 160);
  setTimeout(() => image.src = originalSrc, 240);
}

let current = 0;
let currentFrames = neutral_frames;
let animationTimeout;
  
function showNextImage() {
    const frame = currentFrames[current];
    document.getElementById("displayed-image").src = frame.src;
  
    current = (current + 1) % currentFrames.length;
    animationTimeout = setTimeout(showNextImage, frame.duration);
}

const subtleGazeOptions = [neutral_frames, L2_frames, R2_frames];
const avertedGazeOptions = [L1_frames, R1_frames];
let dynamicEyeInterval;


function startDynamicEyeBehavior() {
  if (dynamicEyeInterval) clearInterval(dynamicEyeInterval);
  
  dynamicEyeInterval = setInterval(() => {
    const useSubtle = Math.random() < 0.6;
    const selectedFrames = useSubtle
      ? subtleGazeOptions[Math.floor(Math.random() * subtleGazeOptions.length)]
      : avertedGazeOptions[Math.floor(Math.random() * avertedGazeOptions.length)];

    setEyeAnimation(selectedFrames);
  }, 2200);
}

function setEyeAnimation(frames) {
    clearTimeout(animationTimeout);
    currentFrames = frames;
    current = 0;
    showNextImage();
}

window.onload = () => {
  setInterval(blink, 2300);
  setEyeAnimation(neutral_frames);

  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
};