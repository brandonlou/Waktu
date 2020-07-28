const ipc = require('electron').ipcRenderer;
const electron = require('electron');
const path = require('path');
const fs = require('fs');

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newInterval = document.querySelector("select").value;
    electron.ipcRenderer.send("interval-message", newInterval);
});

const DEFAULT_INTERVAL = 60; // 1 hour.

// Runs when window is first loaded.
window.onload = () => {

    console.log("loaded")
    // Read current configuration stored on filesystem.
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
    const interval = storedConfig.interval || DEFAULT_INTERVAL;
    console.log(interval);
    // Select interval as the default.
    const select = document.querySelector("select");
    for(let i, j = 0; i = select.options[j]; j++) {
        if(i.value == interval) {
            select.selectedIndex = j;
            break;
        }
    }
}