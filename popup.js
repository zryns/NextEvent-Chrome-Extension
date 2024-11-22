window.addEventListener("load", function () {
  // Retrieve saved data from localStorage
  let savedEndDate = localStorage.getItem("endDate");
  let savedEventName = localStorage.getItem("eventName");
  let savedCountType = localStorage.getItem("countType") || "all";
  let savedDisplayType = localStorage.getItem("displayType") || "days";

  // If saved end date exists, set the input field value and show the counter
  if (savedEndDate) {
    document.getElementById("endDate").value = savedEndDate;
    showCounterOnPopup(
      new Date(savedEndDate),
      savedCountType,
      savedDisplayType
    );
  }

  if (savedEventName) {
    document.getElementById("eventName").value = savedEventName;
  }

  document.getElementById("countType").value = savedCountType;
  document.getElementById("displayType").value = savedDisplayType;

  initializeExtensionState();

  // Add listeners for user inputs to trigger saveTheInputs function
  document.getElementById("endDate").addEventListener("change", saveTheInputs);
  document.getElementById("eventName").addEventListener("input", saveTheInputs);
  document
    .getElementById("countType")
    .addEventListener("change", saveTheInputs);
  document
    .getElementById("displayType")
    .addEventListener("change", saveTheInputs);
});

// Function to save user input to localStorage
function saveTheInputs() {
  let endDate = document.getElementById("endDate").value;
  let eventName = document.getElementById("eventName").value;
  let countType = document.getElementById("countType").value;
  let displayType = document.getElementById("displayType").value;

  // Validate and save the end date
  if (endDate !== undefined && endDate !== "") {
    let parsedEndDate = new Date(endDate);
    if (parsedEndDate instanceof Date && !isNaN(parsedEndDate)) {
      showCounterOnPopup(parsedEndDate, countType, displayType);
      document.getElementById("endDate").classList.remove("error-input");

      localStorage.setItem("endDate", endDate);
      localStorage.setItem("eventName", eventName);
      localStorage.setItem("countType", countType);
      localStorage.setItem("displayType", displayType);
    } else {
      document.getElementById("endDate").classList.add("error-input");
      alert("Please enter a valid date.");
    }
  } else {
    document.getElementById("endDate").classList.add("error-input");
  }
}

// Function to show the countdown timer on the popup
function showCounterOnPopup(endDate, countType, displayType) {
  let daysLeftElement = document.getElementById("days-left");
  let daysLeft = getDaysLeft(endDate, countType);
  let formattedTime = formatTimeLeft(daysLeft, displayType);

  // Update the inner HTML of the "days-left" element to show the formatted time
  daysLeftElement.innerHTML = formattedTime.value;
  document.getElementById("time-label").textContent = formattedTime.label;

  daysLeftElement.classList.add("updated-date");
  showCountDown();

  setTimeout(function () {
    daysLeftElement.classList.remove("updated-date");
  }, 1000);

  updateIcon(daysLeft, displayType);
}

function showCountDown() {
  document.getElementsByClassName("countdown")[0].classList.remove("hidden");
  document.getElementById("no-date-notice").classList.add("hidden");
}

function hideCountDown() {
  document.getElementsByClassName("countdown")[0].classList.add("hidden");
  document.getElementById("no-date-notice").classList.remove("hidden");
}

function getDaysLeft(endDate, countType) {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (today.getTime() === endDate.getTime()) {
    return 0;
  }

  let daysLeft = 0;
  const oneDayInMs = 1000 * 60 * 60 * 24;

  if (countType === "working") {
    let current = new Date(today);
    while (current < endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysLeft++;
      }
      current.setTime(current.getTime() + oneDayInMs);
    }
  } else {
    daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / oneDayInMs);
  }

  return daysLeft;
}

function formatTimeLeft(daysLeft, displayType) {
  let value, label;

  switch (displayType) {
    case "weeks":
      value = (daysLeft / 7).toFixed(1); // Calculate weeks
      label = "week(s)";
      break;
    case "months":
      value = (daysLeft / 30).toFixed(1); // Approximate months
      label = "month(s)";
      break;
    default:
      value = daysLeft;
      label = "day(s)";
  }

  return { value, label };
}

function updateIcon(daysLeft, displayType) {
  let iconPath = "";
  let iconText = "";

  // Set icon and badge text based on the remaining time and display type
  if (displayType === "weeks") {
    iconText = (daysLeft / 7).toFixed(1) + "w";
  } else if (displayType === "months") {
    iconText = (daysLeft / 30).toFixed(1) + "m";
  } else {
    iconText = daysLeft + "d";
  }

  // Set the icon path based on days left
  if (daysLeft > 10) {
    iconPath = "assets/128x128.png";
  } else if (daysLeft <= 10 && daysLeft > 0) {
    iconPath = "assets/48x48.png";
  } else {
    iconPath = "assets/16x16.png";
  }

  // Update the Chrome extension icon and badge text
  chrome.action.setIcon({ path: iconPath });
  chrome.action.setBadgeText({ text: iconText });
  chrome.action.setBadgeBackgroundColor({ color: "#294fa7" });
}

chrome.runtime.onStartup.addListener(() => {
  initializeExtensionState();
});

// Create a new alarm that triggers every 1440 minutes (24 hours)
chrome.alarms.create("updateCountdown", { periodInMinutes: 1440 });

// Add an event listener for the alarm triggered every day
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateCountdown") {
    initializeExtensionState();
  }
});

function initializeExtensionState() {
  const savedEndDate = localStorage.getItem("endDate");
  const savedCountType = localStorage.getItem("countType") || "all";
  const savedDisplayType = localStorage.getItem("displayType") || "days";

  // If a saved end date exists, calculate and display the countdown
  if (savedEndDate) {
    const endDate = new Date(savedEndDate);
    const daysLeft = getDaysLeft(endDate, savedCountType);
    const formattedTime = formatTimeLeft(daysLeft, savedDisplayType);

    // Update the DOM elements with the formatted time
    document.getElementById("days-left").innerHTML = formattedTime.value;
    document.getElementById("time-label").textContent = formattedTime.label;

    // Update the extension icon and badge text based on the countdown
    updateIcon(daysLeft, savedDisplayType);
  } else {
    // If no saved end date exists, hide the countdown display
    hideCountDown();
  }
}
