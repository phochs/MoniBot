const fs = require('fs');

/**
 * Config
 * Stores the bot config, coming from the config.json file
 */
class Config {
    constructor() {
        this.config = {};
    }

    /**
     * Get the config data from config.json
     * @param {function} callback - Called when reading the config file has been completed
     */
    getConfig(callback) {
        let filename = 'config.json';

        if(fs.existsSync(filename)) {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err)
                    console.error(err);

                this.config = JSON.parse(data);

                callback();
            })
        }
        else {
            callback();
        }
    }
}

module.exports = Config;