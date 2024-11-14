window.addEventListener("load", function () {
  let savedEndDate = localStorage.getItem("endDate");
  let savedEventName = localStorage.getItem("eventName");
  let savedCountType = localStorage.getItem("countType") || "all";

  if (savedEndDate) {
    document.getElementById("endDate").value = savedEndDate;
    showCounterOnPopup(new Date(savedEndDate), savedCountType);
  }

  if (savedEventName) {
    document.getElementById("eventName").value = savedEventName;
  }

  document.getElementById("countType").value = savedCountType;
});

document.getElementById("endDate").addEventListener("change", saveTheInputs);
document.getElementById("eventName").addEventListener("input", saveTheInputs);
document.getElementById("countType").addEventListener("change", saveTheInputs);

function saveTheInputs() {
  let endDate = document.getElementById("endDate").value;
  let eventName = document.getElementById("eventName").value;
  let countType = document.getElementById("countType").value;

  if (endDate !== undefined && endDate !== "") {
    let parsedEndDate = new Date(endDate);
    if (parsedEndDate instanceof Date && !isNaN(parsedEndDate)) {
      showCounterOnPopup(parsedEndDate, countType);
      document.getElementById("endDate").classList.remove("error-input");

      localStorage.setItem("endDate", endDate);
      localStorage.setItem("eventName", eventName);
      localStorage.setItem("countType", countType);
    } else {
      document.getElementById("endDate").classList.add("error-input");
      alert("Please enter a valid date.");
    }
  } else {
    document.getElementById("endDate").classList.add("error-input");
  }
}

function showCounterOnPopup(endDate, countType) {
  let daysLeftElement = document.getElementById("days-left");
  daysLeftElement.innerHTML = getDaysLeft(endDate, countType);
  daysLeftElement.classList.add("updated-date");
  showCountDown();

  setTimeout(function () {
    daysLeftElement.classList.remove("updated-date");
  }, 1000);

  updateIcon(getDaysLeft(endDate, countType));
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
  today.setHours(0, 0, 0, 0); // Set `today` to midnight
  endDate.setHours(0, 0, 0, 0); // Set `endDate` to midnight

  if (today.getTime() === endDate.getTime()) {
    return 0; // If today is the end date, no days left
  }

  let daysLeft = 0;
  const oneDayInMs = 1000 * 60 * 60 * 24;

  if (countType === "working") {
    let current = new Date(today);
    while (current < endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        // Exclude Sunday (0) and Saturday (6)
        daysLeft++;
      }
      current.setTime(current.getTime() + oneDayInMs);
    }
  } else {
    daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / oneDayInMs);
  }

  return daysLeft;
}

function updateIcon(daysLeft) {
  let iconPath = "";

  if (daysLeft > 10) {
    iconPath = "assets/128x128.png";
  } else if (daysLeft <= 10 && daysLeft > 0) {
    iconPath = "assets/48x48.png";
  } else {
    iconPath = "assets/16x16.png";
  }

  chrome.action.setIcon({ path: iconPath });
  chrome.action.setBadgeText({ text: daysLeft.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#294fa7" });
}
