const Guilds = require('./Guilds');
const Webserver = require('./Webserver');
const Config = require('./Config');

/**
 * MoniBot
 * The main class for the Discord metrics.
 */
class MoniBot {
    constructor() {
        this.guilds = null;
        this.server = null;
        this.config = null;
    }

    /**
     * Bootstrapper. Run this method to start the bot.
     */
    run() {
        this.config = new Config();
        this.config.getConfig(() => {
            this.guilds = new Guilds(this.config);
            this.guilds.connect(() => {
                this.server = new Webserver(this.guilds, this.config);
            });
        });
    }
}

module.exports = MoniBot;