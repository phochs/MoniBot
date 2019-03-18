const express = require('express');

/**
 * Webserver
 * Using ExpressJS, creates a web server where Prometheus can request metrics for all connected Guilds
 */
class Webserver {
    /**
     * Constructor
     * @param {Guilds} guilds - The Guilds instance
     * @param {Config} config - The bot configuration
     */
    constructor(guilds, config) {
        this.app = express();
        this.guilds = guilds;
        this.config = config;

        this._registerRoutes();

        this.app.listen(this.config.config.port, () => console.log(`App is listening on port ${this.config.config.port}`));
    }

    /**
     * Registers all available routes for the webserver. Currently, it's just a single route with a parameter for the Guild ID.
     * @protected
     */
    _registerRoutes() {
        this.app.get('/:guild/metrics', (req, res) => {
            let guild = this.guilds.guilds[req.params.guild];
            if(typeof guild !== 'undefined') {
                guild.getMetrics((contentType, metrics) => {
                    res.set('Content-Type', contentType);
                    res.end(metrics);
                });
            }
            else {
                res.send('Guild not found');
            }
        });
    }
}

module.exports = Webserver;