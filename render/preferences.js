const electron = require('electron');
const path = require('path');
const fs = require('fs');

/** Represents the default selected time in between breaks. */
const DEFAULT_INTERVAL = 60; // 1 hour.

/** Represents the form element on the preferences pane. */
const form = document.querySelector("form");

/** Listens for a form submission and sends the selected value to the main process. */
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newInterval = document.querySelector("select").value;
    electron.ipcRenderer.send("interval-message", newInterval);
});

/** Runs once when the window is initially loaded. */
window.onload = () => {

    // Read current user configuration stored on filesystem.
    const userDataPath = electron.remote.app.getPath("userData");
    const filePath = path.join(userDataPath, "config.json");
    let storedConfig = null;
    try {
        storedConfig = JSON.parse(fs.readFileSync(filePath));
    } catch {
        storedConfig = {
            interval: DEFAULT_INTERVAL
        };
    }

    // If there is no stored interval, use the default.
    const interval = storedConfig.interval || DEFAULT_INTERVAL;

    // Use stored interval as value to select the default dropdown option seen by the user.
    const select = document.querySelector("select");
    for(let i, j = 0; i = select.options[j]; j++) {
        if(i.value == interval) {
            select.selectedIndex = j;
            break;
        }
    }
}