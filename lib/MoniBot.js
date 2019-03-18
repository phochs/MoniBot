const Guilds = require('./Guilds');
const Webserver = require('./Webserver');
const Config = require('./Config');
const async = require('async');

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
        async.series([
            call => {
                this.config = new Config();
                this.config.getConfig(call);
            },
            call => {
                this.guilds = new Guilds(this.config);
                this.guilds.connect(call);
            },
            call => {
                this.server = new Webserver(this.guilds, this.config, call);
            },
        ])
    }
}

module.exports = MoniBot;