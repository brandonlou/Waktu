const { app, ipcMain, dialog, shell, Menu, Tray, Notification, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const DEFAULT_INTERVAL = 60; // 1 hour.
// In minutes. One more minute will result in an integer overflow when converted to milliseconds.
const MAX_INTERVAL = 35791;

let enabled = true;

let preferencesWindow, aboutWindow = null;

// Converts minutes to milliseconds.
const minToMs = (minutes) => {
    return minutes * 60000;
}

const openPreferencesPage = () => {
    // Prevent more than one instance of a preference window.
    if(preferencesWindow) {
        return;
    }
    preferencesWindow = new BrowserWindow({
        height: 400,
        width: 300,
        webPreferences: {
            nodeIntegration: true, // This allows ipcRenderer to work.
            enableRemoteModule: true, // Hides deprecation warning.
            devTools: false
        }
    });
    preferencesWindow.loadFile("./preferences.html");
    preferencesWindow.setResizable(false);
    preferencesWindow.on("closed", () => {
        preferencesWindow = null;
    });
}

const openAboutPage = () => {

    // About dialog options.
    const options = {
        type: "info",
        buttons: ["Close", "Source", "Donate"],
        title: "Waktu",
        defaultId: 0, // "Close" is highlighted by default.
        message: "Waktu v. " + app.getVersion(), // Gets version from package.json
        detail: "Extra detail",
        icon: "./icon.png",
        cancelId: 0
    };

    // Display the about dialog.
    dialog.showMessageBox(options).then((data) => {
        // Handle button clicked.
        switch(data.response) {
            case 0: // Cancel
                break;
            case 1: // Source
                shell.openExternal("https://github.com/brandonlou/Waktu");
                break;
            case 2: // Donate
                openDonateLink();
                break;
            default:
                break;
        }
    });

}

// Opens a donation page (which I do not have yet)
const openDonateLink = () => {
    return;
}

const handleClickEnable = () => {
    enabled = !enabled;
    console.log("Enabled: " + enabled);
}

// Keep tray global to prevent it from dissapearing.
let tray = null;

const createSystemTray = () => {
    tray = new Tray("./icon.png");
    const contextMenu = Menu.buildFromTemplate([
        {
            type: "normal",
            label: "Next break in: xxx",
            toolTip: "Functionality will be added in a future version.",
            enabled: false
        },
        {
            type: "checkbox",
            label: "Enable (click to toggle)",
            toolTip: "Check/uncheck to enable or disable break reminders.",
            checked: true,
            click: handleClickEnable
        },
        {
            type: "separator"
        },
        {
            type: "normal",
            label: "Preferences",
            toolTip: "Opens the preferences pane.",
            click: openPreferencesPage
        },
        {
            type: "separator"
        },
        {
            type: "normal",
            label: "Donate",
            toolTip: "Opens an external link to donate. Thank you :)",
            click: openDonateLink
        },
        {
            type: "normal",
            label: "About",
            toolTip: "Opens the about pane.",
            click: openAboutPage
        },
        {
            type: "separator"
        },
        {
            type: "normal",
            label: "Quit Waktu",
            toolTip: "Quits the application.",
            click: () => {
                app.quit();
            }
        }
    ]);
    tray.setToolTip("Remember to take a break!"); // Hover text for tray icon.
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(createSystemTray);

// Calls whenever a break time is due.
const onBreakTime = () => {

    if(!enabled) {
        console.log("Skipping break");
        return;
    }

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
        interval: minToMs(DEFAULT_INTERVAL)
    };
}
let interval = minToMs(DEFAULT_INTERVAL);
if(storedConfig.interval) {
    if(storedConfig.interval > MAX_INTERVAL) {
        interval = minToMs(DEFAULT_INTERVAL);
    } else {
        interval = minToMs(storedConfig.interval);
    }
}
console.log("Current interval: " + interval + " ms");
let timer = setInterval(onBreakTime, interval);

// Prevents the default behavior of quitting the application when all windows are closed.
app.on("window-all-closed", (e) => {
    e.preventDefault();
});

// Handles new interval settings.
ipcMain.on("interval-message", (event, arg) => {
    const newIntervalMin = parseInt(arg); // Converts the first argument into an integer.
    let newIntervalMs = minToMs(DEFAULT_INTERVAL);
    if(newIntervalMin > MAX_INTERVAL) {
        newIntervalMs = minToMs(DEFAULT_INTERVAL);
    } else {
        newIntervalMs = minToMs(newIntervalMin);
    }

    // Reset current timer to use new interval.
    clearInterval(timer);
    timer = setInterval(onBreakTime, newIntervalMs);
    console.log("New interval: " + newIntervalMs);

    // Gets OS-specific application path.
    const userDataPath = app.getPath("userData");
    const filePath = path.join(userDataPath, "config.json");

    const newConfig = {
        interval: newIntervalMin
    }

    // Write to config file asynchronously. 
    fs.writeFile(filePath, JSON.stringify(newConfig), (err, result) => {
        if(err) {
            console.error(err);
        }
    });
});

// Hide application the from Mac dock so it's only accessible via the system tray.
// Minor issue: There is a slight blip before the application icon dissapears.
app.dock.hide();