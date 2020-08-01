const { app, ipcMain, dialog, shell, nativeImage, Menu, Tray, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");
const Timer = require("./Timer.js").Timer;

const DEFAULT_INTERVAL = 60; // 1 hour.
const ICON = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));

let checked = true;

let preferencesWindow = null;

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
        icon: ICON,
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
    timer.toggleEnable();
    checked = !checked;
}

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

// Keep tray global to prevent it from dissapearing.
let tray = null;

const createSystemTray = () => {
    tray = new Tray(ICON);
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

// Hide application the from Mac dock so it's only accessible via the system tray.
// Minor issue: There is a slight blip before the application icon dissapears.
app.dock.hide();