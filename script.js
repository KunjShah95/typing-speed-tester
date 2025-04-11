// Quote collections by difficulty
const quotesByDifficulty = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast helps improve productivity and focus.",
    "Practice makes perfect in the world of programming.",
    "Learning to type is an essential skill today.",
    "Start slow and gradually build up your speed."
  ],
  medium: [
    "JavaScript is a powerful language for the web development ecosystem.",
    "Tailwind CSS makes designing fast and fun with utility-first approach.",
    "The best way to predict the future is to invent it, said Alan Kay.",
    "Developing typing speed requires consistent practice and proper technique.",
    "Efficient typing can save you hours of work over the course of a year."
  ],
  hard: [
    "The Document Object Model (DOM) is a programming interface for web documents that represents the page as nodes and objects.",
    "In JavaScript, asynchronous programming is handled through callbacks, promises, and async/await syntax for better readability.",
    "Typing at 80-100 words per minute is considered excellent for professional typists, though programmers often focus on accuracy over raw speed.",
    "A comprehensive typing test measures not only speed and accuracy but also consistency and endurance over longer periods of typing.",
    "The QWERTY keyboard layout was designed in the 1870s to prevent mechanical typewriter jams, not necessarily for typing efficiency."
  ]
};

let timer = 60;
let timerInterval;
let currentQuote = "";
let errorCount = 0;
let startTime;
let started = false;
let currentDifficulty = "medium";
let darkMode = false;
let testHistory = [];

// Initialize or load saved data
function initializeLocalStorage() {
  if (!localStorage.getItem("typingHighscores")) {
    localStorage.setItem("typingHighscores", JSON.stringify([]));
  }
  
  if (localStorage.getItem("typingTestHistory")) {
    testHistory = JSON.parse(localStorage.getItem("typingTestHistory"));
  }
  
  if (localStorage.getItem("typingDarkMode")) {
    darkMode = JSON.parse(localStorage.getItem("typingDarkMode"));
    if (darkMode) {
      applyDarkMode();
    }
  }
}

function setDifficulty(difficulty) {
  if (!started) {
    currentDifficulty = difficulty;
    resetTest();
  } else {
    alert("You can't change difficulty during a test!");
  }
}

function setTimer(seconds) {
  if (!started) {
    timer = seconds;
    document.getElementById("time").textContent = seconds;
    resetTest();
  } else {
    alert("You can't change time during a test!");
  }
}

function setQuote() {
  const quotes = quotesByDifficulty[currentDifficulty];
  currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").textContent = currentQuote;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    document.getElementById("time").textContent = timer;
    if (timer <= 0) {
      endTest();
    }
  }, 1000);
}

function endTest() {
  clearInterval(timerInterval);
  document.getElementById("inputArea").disabled = true;
  
  const input = document.getElementById("inputArea").value;
  const wpm = parseInt(document.getElementById("wpm").textContent);
  const accuracy = parseInt(document.getElementById("accuracy").textContent);
  
  // Save to history
  const testResult = {
    date: new Date().toLocaleString(),
    wpm,
    accuracy,
    errors: errorCount,
    difficulty: currentDifficulty,
    duration: document.getElementById("time").getAttribute("data-original-time"),
    quote: currentQuote.substring(0, 30) + "..."
  };
  
  testHistory.unshift(testResult);
  if (testHistory.length > 10) {
    testHistory.pop();
  }
  localStorage.setItem("typingTestHistory", JSON.stringify(testHistory));
  
  // Save to highscores if good enough
  saveHighscore(wpm, accuracy);
  
  // Update history display
  updateHistory();
}

function saveHighscore(wpm, accuracy) {
  const highscores = JSON.parse(localStorage.getItem("typingHighscores"));
  
  highscores.push({
    wpm,
    accuracy,
    difficulty: currentDifficulty,
    date: new Date().toLocaleString()
  });
  
  // Sort by WPM and keep top 10
  highscores.sort((a, b) => b.wpm - a.wpm);
  if (highscores.length > 10) {
    highscores.length = 10;
  }
  
  localStorage.setItem("typingHighscores", JSON.stringify(highscores));
}

function showHighscores() {
  const highscores = JSON.parse(localStorage.getItem("typingHighscores"));
  const container = document.getElementById("highscores-list");
  container.innerHTML = "";
  
  if (highscores.length === 0) {
    container.innerHTML = "<p class='text-gray-500 text-center py-4'>No highscores yet!</p>";
  } else {
    const table = document.createElement("table");
    table.className = "w-full";
    
    // Headers
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr class="border-b">
        <th class="text-left py-2">#</th>
        <th class="text-left py-2">WPM</th>
        <th class="text-left py-2">Accuracy</th>
        <th class="text-left py-2">Difficulty</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement("tbody");
    highscores.forEach((score, index) => {
      const row = document.createElement("tr");
      row.className = index % 2 ? "bg-gray-50" : "";
      row.innerHTML = `
        <td class="py-2">${index + 1}</td>
        <td class="py-2 font-bold">${score.wpm}</td>
        <td class="py-2">${score.accuracy}%</td>
        <td class="py-2 capitalize">${score.difficulty}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    container.appendChild(table);
  }
  
  document.getElementById("highscores-modal").classList.remove("hidden");
}

function closeHighscores() {
  document.getElementById("highscores-modal").classList.add("hidden");
}

function updateHistory() {
  const historyContainer = document.getElementById("history");
  historyContainer.innerHTML = "";
  
  if (testHistory.length === 0) {
    historyContainer.innerHTML = "<p class='text-gray-500 text-center py-2'>No test history yet!</p>";
    return;
  }
  
  testHistory.forEach(test => {
    const entry = document.createElement("div");
    entry.className = "border-b border-gray-200 py-2";
    entry.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="font-medium">${test.date}</span>
        <span class="capitalize text-sm px-2 py-0.5 rounded bg-gray-200">${test.difficulty}</span>
      </div>
      <div class="flex justify-between mt-1">
        <span>WPM: <strong>${test.wpm}</strong></span>
        <span>Accuracy: <strong>${test.accuracy}%</strong></span>
        <span>Errors: <strong>${test.errors}</strong></span>
      </div>
    `;
    historyContainer.appendChild(entry);
  });
}

function checkTyping() {
  const input = document.getElementById("inputArea").value;

  if (!started && input.length > 0) {
    startTimer();
    started = true;
    startTime = new Date();
    
    // Store original time for history
    document.getElementById("time").setAttribute("data-original-time", timer);
  }

  let correctChars = 0;
  errorCount = 0;

  for (let i = 0; i < input.length; i++) {
    if (i < currentQuote.length && input[i] === currentQuote[i]) {
      correctChars++;
    } else {
      errorCount++;
    }
  }

  // Calculate accuracy
  const totalTyped = input.length;
  const accuracy = totalTyped > 0 ? Math.floor((correctChars / totalTyped) * 100) : 100;

  // Calculate WPM: (characters / 5) / time in minutes
  const timeElapsed = (new Date() - startTime) / 1000 / 60; // in minutes
  const wpm = timeElapsed > 0 ? Math.round((correctChars / 5) / timeElapsed) : 0;

  document.getElementById("errors").textContent = errorCount;
  document.getElementById("wpm").textContent = wpm;
  document.getElementById("accuracy").textContent = accuracy;
  
  // Check if test is complete
  if (input.length >= currentQuote.length && input === currentQuote) {
    endTest();
  }
}

function resetTest() {
  clearInterval(timerInterval);
  document.getElementById("inputArea").disabled = false;
  document.getElementById("inputArea").value = "";
  document.getElementById("wpm").textContent = 0;
  document.getElementById("errors").textContent = 0;
  document.getElementById("accuracy").textContent = 100;
  document.getElementById("time").textContent = timer;
  started = false;
  errorCount = 0;
  setQuote();
}

function toggleTheme() {
  darkMode = !darkMode;
  localStorage.setItem("typingDarkMode", JSON.stringify(darkMode));
  
  if (darkMode) {
    applyDarkMode();
  } else {
    removeDarkMode();
  }
}

function applyDarkMode() {
  const body = document.getElementById("app-body");
  const container = document.getElementById("container");
  const quoteDiv = document.getElementById("quote");
  const textarea = document.getElementById("inputArea");
  const historyDiv = document.getElementById("history");
  
  body.classList.remove("bg-gray-100");
  body.classList.add("bg-gray-900");
  
  container.classList.remove("bg-white");
  container.classList.add("bg-gray-800", "text-white");
  
  quoteDiv.classList.remove("bg-gray-100", "text-gray-700");
  quoteDiv.classList.add("bg-gray-700", "text-gray-200");
  
  textarea.classList.add("bg-gray-700", "text-gray-200");
  textarea.classList.remove("text-gray-700");
  
  historyDiv.classList.remove("bg-gray-50");
  historyDiv.classList.add("bg-gray-700", "text-gray-200");
}

function removeDarkMode() {
  const body = document.getElementById("app-body");
  const container = document.getElementById("container");
  const quoteDiv = document.getElementById("quote");
  const textarea = document.getElementById("inputArea");
  const historyDiv = document.getElementById("history");
  
  body.classList.add("bg-gray-100");
  body.classList.remove("bg-gray-900");
  
  container.classList.add("bg-white");
  container.classList.remove("bg-gray-800", "text-white");
  
  quoteDiv.classList.add("bg-gray-100", "text-gray-700");
  quoteDiv.classList.remove("bg-gray-700", "text-gray-200");
  
  textarea.classList.remove("bg-gray-700", "text-gray-200");
  textarea.classList.add("text-gray-700");
  
  historyDiv.classList.add("bg-gray-50");
  historyDiv.classList.remove("bg-gray-700", "text-gray-200");
}

window.onload = function() {
  initializeLocalStorage();
  updateHistory();
  resetTest();
};