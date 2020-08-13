/**
 * Represents all the possible notification messages.
 */
const messages = [
    "Relax your eyes!",
    "Is your neck getting stiff?",
    "Don't forget to stay hydrated!",
    "Roll your neck in circles",
    "Stand up! Walk around!",
    "A 10 minute walk would be nice...",
    "Good time to fill up your water, eh?",
    "Mmm... I'm all about that fresh air",
    "Look at a distant object for 10 seconds!",
    "Is your back straightened?",
    "Unhunch your back!",
    "Stretch out. Reach for the sky!",
    "Take this opportunity to get a snack!",
    "You got this! But after your break.",
    "After all that work, you deserve a break!"
];

/**
 * Returns a random notification message.
 * @returns { string } A random message.
 */
const getMessage = () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

module.exports = { getMessage };