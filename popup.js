window.addEventListener('load', function() {
    let savedEndDate = localStorage.getItem('endDate');
    let savedEventName = localStorage.getItem('eventName');
    let savedCountType = localStorage.getItem('countType') || 'all'; // Default to 'all'
  
    if (savedEndDate) {
      document.getElementById('endDate').value = savedEndDate;
      showCounterOnPopup(new Date(savedEndDate), savedCountType);
    }
  
    if (savedEventName) {
      document.getElementById('eventName').value = savedEventName;
    }
  
    document.getElementById('countType').value = savedCountType; // Restore saved count type
  });
  
  // Listen for input changes and update on the fly
  document.getElementById('endDate').addEventListener('change', saveTheInputs);
  document.getElementById('eventName').addEventListener('input', saveTheInputs); // Use 'input' for live typing updates
  document.getElementById('countType').addEventListener('change', saveTheInputs);
  
  function saveTheInputs() {
    let endDate = document.getElementById('endDate').value;
    let eventName = document.getElementById('eventName').value;
    let countType = document.getElementById('countType').value; // Get the selected count type
  
    if (endDate !== undefined && endDate !== '') {
      let parsedEndDate = new Date(endDate);
      if (parsedEndDate instanceof Date && !isNaN(parsedEndDate)) {
        showCounterOnPopup(parsedEndDate, countType);
        document.getElementById('endDate').classList.remove('error-input');
        
        localStorage.setItem('endDate', endDate);
        localStorage.setItem('eventName', eventName);
        localStorage.setItem('countType', countType); // Save the selected count type
      } else {
        document.getElementById('endDate').classList.add('error-input');
        alert("Please enter a valid date.");
      }
    } else {
      document.getElementById('endDate').classList.add('error-input');
    }
  }
  
  function showCounterOnPopup(endDate, countType) {
    let daysLeftElement = document.getElementById('days-left');
    daysLeftElement.innerHTML = getDaysLeft(endDate, countType);
    daysLeftElement.classList.add('updated-date');
    showCountDown();
  
    setTimeout(function() {
      daysLeftElement.classList.remove('updated-date');
    }, 1000);
  }
  
  function showCountDown() {
    document.getElementsByClassName('countdown')[0].classList.remove('hidden');
    document.getElementById('no-date-notice').classList.add('hidden');
  }
  
  function hideCountDown() {
    document.getElementsByClassName('countdown')[0].classList.add('hidden');
    document.getElementById('no-date-notice').classList.remove('hidden');
  }
  
  function getDaysLeft(endDate, countType) {
    var today = new Date();
    var one_day = 1000 * 60 * 60 * 24;
    var daysLeft = 0;
  
    if (countType === 'working') {
      // Count only working days (Mon-Fri)
      while (today <= endDate) {
        if (today.getDay() !== 0 && today.getDay() !== 6) {
          daysLeft++; // Increment for weekdays only (Mon-Fri)
        }
        today.setDate(today.getDate() + 1);
      }
    } else {
      // Count all days
      daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / one_day);
    }
  
    return daysLeft;
  }
  