const { app, ipcMain, dialog, shell, nativeImage, Menu, Tray, BrowserWindow, Notification } = require("electron");
const fs = require("fs");
const path = require("path");
const Timer = require("./Timer.js").Timer;
const exec = require("child_process").exec;

const DEFAULT_INTERVAL = 60; // 1 hour.
const ICON_IMAGE = nativeImage.createFromPath(path.join(__dirname, '/assets/icons/icon.png'));
const LOGO_IMAGE = nativeImage.createFromPath(path.join(__dirname, '/assets/icons/logo.png'));

let checked = true;

let preferencesWindow = null;

/**
 * Opens the preferences window.
 * @returns {void} Nothing.
 */
const openPreferencesPage = () => {

    // Prevent more than one instance of a preference window.
    if(preferencesWindow) {
        return;
    }

    preferencesWindow = new BrowserWindow({
        height: 400,
        width: 300,
        webPreferences: {
            nodeIntegration: true, // Allows ipcRenderer to work.
            enableRemoteModule: true, // Hides deprecation warning.
            devTools: false // Disables user from accessing chrome dev tools (feels more native)
        }
    });

    preferencesWindow.loadFile("./render/preferences.html");
    preferencesWindow.setResizable(false);
    preferencesWindow.on("closed", () => {
        preferencesWindow = null;
    });

}

/**
 * Opens the about dialog.
 * @returns {void} Nothing.
 */
const openAboutPage = () => {

    // About dialog options.
    const options = {
        type: "info",
        buttons: ["Close", "Source", "Donate"],
        title: "Waktu",
        defaultId: 0, // "Close" is highlighted by default.
        message: "Waktu v" + app.getVersion(), // Gets version from package.json
        detail: "Extra detail",
        icon: LOGO_IMAGE,
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

/**
 * Show your support by opening an external link to a donation page!
 * @returns {void} Virtual hugs and appreciations.
 */
const openDonateLink = () => {
    return;
}

const handleClickEnable = () => {
    timer.toggleEnable();
    checked = !checked;
}

/**
 * Emits a notification and opens an info dialog with instructions on how to enable notifications.
 * @returns {void} Nothing.
 */
const handleTestNotification = () => {

    const notification = new Notification({
        title: "Hey there!",
        subtitle: "This is a test notification from Waktu.",
        body: "Have a great day :)",
        silent: false,
        hasReply: false,
        timeoutType: "never", // Notification will persist (doesn't work on Electron 8+)
        urgency: "critical",
        closeButtonText: "Close"
    });
    notification.show();

    const dialogOptions = {
        type: "info",
        buttons: ["Close", "Open Notification Permissions"],
        title: "Waktu",
        defaultId: 0, // "Close" is highlighted by default.
        message: "How to enable notifications",
        detail: "If you didn't see a notification, click the Open Notification Permissions button below. Once System Preferences has opened, select Waktu from the menu on the left. Toggle \"Allow Notifications from Waktu\" and click \"Alerts\" as the alert style.",
        cancelId: 0,
        icon: LOGO_IMAGE
    };

    dialog.showMessageBox(dialogOptions).then((data) => {
        if(data.response == 1) { // Second button clicked.
            // Open the Notifications pane on System Preferences.
            exec("open 'x-apple.systempreferences:com.apple.preference.notifications'", (error, stdout, stderr) => {
                if(error) {
                    console.error(error);
                }
                if(stderr) {
                    console.error(stderr);
                }
            });
        }
    });
}

/**
 * Creates an Electron menu for the system tray.
 * @returns {Electron.Menu} The Electron menu.
 */
const getContextMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
        {
            type: "normal",
            label: "Next break in: " + timer.getTimeRemaining(),
            toolTip: "Functionality will be added in a future version.",
            enabled: false
        },
        {
            type: "checkbox",
            label: "Enable (click to toggle)",
            toolTip: "Check/uncheck to enable or disable break reminders.",
            checked: checked,
            click: handleClickEnable
        },
        {
            type: "normal",
            label: "Test Notifications",
            tooltip: "Click to test if notifications will show.",
            click: handleTestNotification
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
    return contextMenu;
}

/** 
 * Represents the system tray. Keep as a global variable to prevent it from dissapearing when
 * Javascript's garbage collector removes it :(
*/
let tray = null;

/**
 * Creates a system tray using the tray global variable and sets options.
 * @returns {void} Nothing.
 */
const createSystemTray = () => {
    tray = new Tray(ICON_IMAGE);
    tray.setToolTip("Remember to take a break!"); // Hover text for tray icon.
    tray.setContextMenu(getContextMenu());
    tray.on("click", (event, bounds, position) => {
        tray.setContextMenu(getContextMenu());
    });
}

app.whenReady().then(createSystemTray);

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
let timer = new Timer(storedConfig.interval);

// Prevents the default behavior of quitting the application when all windows are closed.
app.on("window-all-closed", (e) => {
    e.preventDefault();
});

// Handles new interval settings.
ipcMain.on("interval-message", (event, arg) => {
    const newIntervalMin = parseInt(arg); // Converts the first argument into an integer.

    timer.setTime(newIntervalMin);

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

// Hide application from the Mac dock so it is only accessible via the system tray.
// Minor issue: There is a slight blip before the application icon dissapears.
app.dock.hide();