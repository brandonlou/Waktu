const { Notification } = require("electron");

class Timer {

    #DEFAULT_INTERVAL = 60; // 1 hour.
    #MAX_INTERVAL = 35791; // One more minute will result in integer overflow when converting to ms.
    #timer = null;
    #startTime = new Date();
    #currentInterval = null;
    #enabled = true;

    /**
     * Constructor for Timer class.
     * @param {Number} interval Initial interval in between breaktimes.
     */
    constructor(interval) {
        interval = this.sanitizeInterval(interval);
        this.#currentInterval = interval;
        this.#timer = setInterval(this.notify, this.minToMs(interval));
        this.#startTime = new Date();
        console.log("New timer started! Interval: " + this.#currentInterval + " min.");
    }

    /**
     * Converts minutes to milliseconds.
     * @param {Number} minutes Number of minutes
     * @returns {Number} Milliseconds
     */
    minToMs(minutes) {
        return minutes * 60000;
    }

    /**
     * Checks if given interval is a number and less than the max interval.
     * @param {Number} interval In minutes
     * @returns {Number} In minutes
     */
    sanitizeInterval(interval) {
        if(isNaN(interval) || interval > this.#MAX_INTERVAL) {
            return this.#DEFAULT_INTERVAL;
        }
        return interval;
    }

    /**
     * Enables or disables notifications based on current state.
     * @returns {void} Nothing
     */
    toggleEnable() {
        this.#enabled = !this.#enabled;
        console.log("Enabled: " + this.#enabled);
    }

    notify() {
        console.log("Breaktime!");

        if(!this.#enabled) {
            return;
        }

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
            timeoutType: "never", // Notification will persist (doesn't work on Electron 8+)
            urgency: "critical",
            closeButtonText: "Ignore"
        });

        notification.show();
    }

    /**
     * Resets the current timer with the given interval.
     * @param {Number} newInterval
     * @returns {void} Nothing
     */
    setTime(newInterval) {
        newInterval = this.sanitizeInterval(newInterval);
        this.#currentInterval = newInterval;

        clearInterval(this.#timer);
        this.#timer = setInterval(this.notify, this.minToMs(newInterval));

        this.#startTime = new Date(); // Reset start time.
        console.log("Set new interval: " + this.#currentInterval + " min.");
    }

    /**
     * Returns the time until next breaktime.
     * @returns {void} Nothing
     */
    getTimeRemaining() {
        const currentTime = new Date();
        const timeDifference = currentTime - this.#startTime;
        console.log(timeDifference);
    }

}

module.exports = {Timer};