const { Notification } = require("electron");

/** Class representing a repeating timer. */
class Timer {

    /** Default interval in minutes. */
    #DEFAULT_INTERVAL = 60;

    /** Maximum interval in minutes. Calculated based on preventing integer overflow when converting
     * to milliseconds. */
    #MAX_INTERVAL = 35791;

    /** ID value of the timer set using setInterval(). */
    #timer = null;

    /** Time when timer starts. */
    #startTime = new Date();

    /** Current time in between breaktimes. */
    #currentInterval = null;

    /** Whether user will be notified or not. */
    #enabled = true;

    /**
     * Creates a Timer.
     * @param {Number} interval Initial interval in between breaktimes.
     */
    constructor(interval) {
        interval = this.sanitizeInterval(interval);
        this.#currentInterval = interval;
        this.#timer = setInterval(this.notify.bind(this), this.minToMs(interval));
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

    /**
     * Notifies the user when it's their breaktime.
     * @returns {void} Nothing
     */
    notify() {

        this.#startTime = new Date();
        console.log("Breaktime!");

        if(!this.#enabled) {
            console.log("Skipping notification.");
            return;
        }

        if(!Notification.isSupported()) {
            console.log("Notifications are not supported");
            return;
        }
    
        // Create and show a notification to take a break.
        const notification = new Notification({
            title: "It's your breaktime!",
            subtitle: "Relax your eyes",
            body: "You've been staring too long at the screen",
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
        // We have to bind 'this' or else the context of 'this' is the window in setInterval and not
        // the class itself.
        this.#timer = setInterval(this.notify.bind(this), this.minToMs(newInterval));

        this.#startTime = new Date(); // Reset start time.
        console.log("Set new interval: " + this.#currentInterval + " min.");
    }

    /**
     * Returns the time until next breaktime.
     * @returns {String} String representing number of minutes.
     */
    getTimeRemaining() {
        const currentTime = new Date();
        const timeDiffMs = currentTime - this.#startTime;
        const timeDiffMin = timeDiffMs / 60000;
        const roundedTimeDiff = Math.round(timeDiffMin);
        const timeToBreak = this.#currentInterval - roundedTimeDiff;
        if(timeToBreak < 0) {
            return "—"; // Em dash
        } else if(timeToBreak === 0) {
            return "< 1 min."
        } else {
            return timeToBreak + " min.";
        }
    }

}

module.exports = { Timer };