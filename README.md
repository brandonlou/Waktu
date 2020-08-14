<h1 align="center">Waktu</h1>
<p align="center"><img src="/assets/icons/logo.svg" alt="Waktu" width="25%"/></p>
<p align="center" style="text-align:justify">
    <a href="#general">General</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#screenshots">Screenshots</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#setup">Setup</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#usage">Usage</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#features">Features</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#inspiration">Inspiration</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#credits">Credits</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="#license">License</a>
</p>

## General
Waktu is a simple cross-platform application that reminds you to take breaks from your screen! Underneath it runs on Electron.js and interfaces with the native OS's system tray.

## Screenshots

## Setup
1. Requirements: `node`.
2. Clone this repo and navigate to project root.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the Electron app.

### Packaging for macOS
1. From the project root, run `npm run package-mac`.
2. Open the application bundle located in `Waktu-darwin-x64/Waktu.app`.

## Usage
* If opening `Waktu.app` for the first time, you may have to right it, select `Open` from the context menu, and click `Open` on the dialog that appears.
* Waktu will appear on your system tray at the top.
* Click on the icon to enable/disable breaktime notifications, set working time in opening Preferences, and test to see if notifications appear.

## Features
* Custom intervals in between break times.
* Ability to enable and disable break notifications.
* Non-intrusive reminders.

### To-do List:
* Start automatically on computer startup.
* UI Improvements.
* Custom notification sounds.
* Test on Windows and Linux (low priority).
* Smaller app binary (low priority).

## Inspiration
Waktu was inspired by an unhealthy tendency to spend long periods of time sitting in front the computer. I wanted to take more breaks in order to combat my stiff neck muscles and fatigued eyes. Other screentime reminder apps were either too flashy or cost a fee, so Waktu arose as a minimalistic open-source solution to this problem.

## Credits

## License
[GPL-3.0 License](LICENSE)