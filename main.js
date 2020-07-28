const { app, Menu, Tray, Notification, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const DEFAULT_INTERVAL = 60000;

let preferencesWindow, aboutWindow = null;

const openPreferencesPage = () => {
    // Prevent more than one instance of a preference window.
    if(preferencesWindow) {
        return;
    }
    preferencesWindow = new BrowserWindow({
        height: 400,
        width: 300,
        webPreferences: {
            nodeIntegration: true
        }
    });
    preferencesWindow.loadFile("./preferences.html");
    preferencesWindow.setResizable(false);
    preferencesWindow.on("closed", () => {
        preferencesWindow = null;
    });
}

const openAboutPage = () => {
    aboutWindow = new BrowserWindow({
        height: 400,
        width: 300
    });
    aboutWindow.loadFile("./about.html");
    aboutWindow.setResizable(false);
    aboutWindow.on("closed", () => {
        aboutWindow = null;
    });
}

const openDonateLink = () => {

}

let tray = null;
const createSystemTray = () => {
    tray = new Tray("./icon.png");
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Next break in: xxx",
            enabled: false
        },
        {
            label: "Enabled (click to disable)",
            type: "radio"
        },
        {
            type: "separator"
        },
        {
            label: "Preferences",
            click: openPreferencesPage
        },
        {
            type: "separator"
        },
        {
            label: "Donate",
            click: openDonateLink
        },
        {
            label: "About",
            click: openAboutPage
        }
    ]);
    tray.setToolTip("Remember to take a break!"); // Hover text for tray icon.
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(createSystemTray);

// Calls whenever a break time is due.
const onBreakTime = () => {
    console.log("Breaktime!");

    if(!Notification.isSupported()) {
        console.log("Notifications are not supported");
        return;
    }

    // Create and show a notification to take a break.
    const notification = new Notification({
        title: "Please take a break!",
        subtitle: "right now",
        body: "this is the body",
        silent: false,
        icon: "./icon.png",
        hasReply: false,
        timeoutType: "never", // Notification will persist on the screen.
        urgency: "critical",
        closeButtonText: "Ignore"
    });
    notification.show();
}

// Setup initial repeating timer.
// TODO: Modularize
const userDataPath = app.getPath("userData");
const filePath = path.join(userDataPath, "config.json");
let storedConfig = null;
try {
    storedConfig = JSON.parse(fs.readFileSync(filePath));
} catch {
    storedConfig = {
        interval: DEFAULT_INTERVAL
    };
}
const interval = storedConfig.interval | DEFAULT_INTERVAL;
let timer = setInterval(onBreakTime, interval);

// Prevents the default behavior of quitting the application when all windows are closed.
app.on("window-all-closed", (e) => {
    e.preventDefault();
});

// Handles new interval settings.
ipcMain.on("interval-message", (event, arg) => {
    const newInterval = parseInt(arg); // Converts the first argument into an integer.

    // Reset current timer to use new interval.
    clearInterval(timer);
    timer = setInterval(onBreakTime, newInterval);
    console.log("New interval: " + newInterval);

    // Gets OS-specific application path.
    const userDataPath = app.getPath("userData");
    const filePath = path.join(userDataPath, "config.json");

    const newConfig = {
        interval: newInterval
    }

    // Write to config file asynchronously. 
    fs.writeFile(filePath, JSON.stringify(newConfig), (err, result) => {
        if(err) {
            console.error(err);
        }
    });
});