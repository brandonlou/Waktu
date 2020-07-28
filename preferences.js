const ipc = require('electron').ipcRenderer;

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newInterval = document.querySelector("select").value;
    ipc.send("interval-message", newInterval);
});