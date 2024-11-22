import { initialize } from "./popup.js"; // Assuming you export initialize function

describe("NextEvent Chrome Extension", () => {
  let mockLocalStorage;

  beforeAll(() => {
    // Mock chrome.runtime
    global.chrome = {
      runtime: {
        onStartup: {
          addListener: jest.fn(),
        },
      },
      alarms: {
        create: jest.fn(), // Mock the create method
        onAlarm: {
          addListener: jest.fn(), // Mock the addListener method
        },
      },
    };
  });

  beforeEach(() => {
    // Mock localStorage before each test
    mockLocalStorage = {};
    global.localStorage = {
      getItem: (key) => mockLocalStorage[key] || null,
      setItem: (key, value) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key) => {
        delete mockLocalStorage[key];
      },
    };

    // Set up mock HTML structure for testing
    document.body.innerHTML = `
      <div class="center">
        <div id="no-date-notice" class="hidden">Select a date to chase!</div>
        <div class="countdown">
          <input type="text" id="eventName" placeholder="Enter event name" />
          <div id="days-container">
            <span id="days-left"></span>
            <span id="time-label"></span>
          </div>
        </div>
        <hr />
        <div class="info">The clock is ticking until</div>
        <input type="date" id="endDate" />
        <label for="countType">Count days:</label>
        <select id="countType">
          <option value="all">All Days</option>
          <option value="working">Weekdays Only (Mon-Fri)</option>
        </select>

        <label for="displayType">Show remaining as:</label>
        <select id="displayType">
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
        </select>

        <button id="listButton" class="top-right-button">
          <i class="fa-solid fa-list-check"></i>
        </button>

        <div id="eventList" class="hidden">
          <h3>Event List</h3>
          <ul id="eventItems"></ul>
        </div>
      </div>
    `;

    // Mocking the addEventListener function by calling the functions directly
    const saveTheInputs = jest.fn();
    document
      .getElementById("endDate")
      .addEventListener("change", saveTheInputs);
    document
      .getElementById("eventName")
      .addEventListener("input", saveTheInputs);
    document
      .getElementById("countType")
      .addEventListener("change", saveTheInputs);
    document
      .getElementById("displayType")
      .addEventListener("change", saveTheInputs);
  });

  test("sets up the alarm listener correctly", () => {
    // Simulate the alarm being created
    chrome.alarms.create("updateCountdown", { periodInMinutes: 1440 });

    // Check if the addListener method was called
    expect(chrome.alarms.onAlarm.addListener).toHaveBeenCalled();
  });

  test("loads saved data from localStorage and displays countdown", () => {
    // Simulate loading saved data
    mockLocalStorage.endDate = "2024-12-31";
    mockLocalStorage.eventName = "New Year";
    mockLocalStorage.countType = "all";
    mockLocalStorage.displayType = "days";

    // Simulate window load event
    window.dispatchEvent(new Event("load"));

    // Check if the values are properly loaded
    expect(document.getElementById("endDate").value).toBe("2024-12-31");
    expect(document.getElementById("eventName").value).toBe("New Year");
    expect(document.getElementById("countType").value).toBe("all");
    expect(document.getElementById("displayType").value).toBe("days");

    // Verify countdown display updates
    expect(document.getElementById("days-left").innerHTML).not.toBe("");
    expect(document.getElementById("time-label").textContent).not.toBe("");
  });

  test("saves user inputs to localStorage on change", () => {
    // Set initial value for endDate
    document.getElementById("endDate").value = "2024-12-25";

    // Simulate user interaction
    document.getElementById("endDate").dispatchEvent(new Event("change"));

    // Check if localStorage is updated with the new date
    expect(mockLocalStorage.endDate).toBe("2024-12-25");
  });

  test("shows error if invalid date is entered", () => {
    // Set invalid date
    document.getElementById("endDate").value = "invalid-date";

    // Trigger the change event
    document.getElementById("endDate").dispatchEvent(new Event("change"));

    // Check if the error class is added
    expect(
      document.getElementById("endDate").classList.contains("error-input")
    ).toBe(true);
  });

  test("updates the countdown display with the correct value", () => {
    // Create a future date for the countdown
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5); // 5 days from now

    // Simulate countdown update
    showCounterOnPopup(endDate, "all", "days");

    // Verify the countdown updates
    expect(document.getElementById("days-left").innerHTML).toBe("5");
    expect(document.getElementById("time-label").textContent).toBe("day(s)");
  });

  test("hides the countdown when no end date is saved", () => {
    // Remove the end date from localStorage
    mockLocalStorage.removeItem("endDate");

    // Call the function to initialize the state (for example, on window load)
    initialize(); // Explicitly call initialize

    // Verify that the countdown is hidden
    expect(
      document
        .getElementsByClassName("countdown")[0]
        .classList.contains("hidden")
    ).toBe(true);
    expect(
      document.getElementById("no-date-notice").classList.contains("hidden")
    ).toBe(false);
  });
});
