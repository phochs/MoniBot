const path = require('path');
const fs = require('fs');
const async = require('async');

/**
 * MetricDiscovery
 * Static class that searches for all metric classes in the metrics/ folder.
 */
class MetricDiscovery {
    /**
     * Looks for all metric classes
     * @param {function} callback
     * @return {GuildMetric[]} A list of all available metric classes
     * @static
     */
    static findMetrics(callback) {
        let metricsPath = path.join(__dirname, 'metrics');
        let metrics = [];

        // Loop through all files in the metrics/ folder
        fs.readdir(metricsPath, (err, files) => {
            async.each(files, (file, eachCallback) => {
                if (file.endsWith('.js')) { // Ignore all files and folders that don't end with .js (this also catches . and .. folders)
                    file = path.join(metricsPath, file);

                    try {
                        if (fs.lstatSync(file).isFile()) {
                            let Metric = require(file); // Import the metric class

                            metrics.push(Metric);
                        }

                        eachCallback();
                    } catch (e) {
                        console.error(`Error while processing metric file ${path.basename(file)}`);
                        console.error(e);
                    }
                } else {
                    eachCallback();
                }
            }, err => {
                if (err)
                    console.error(err);

                if (callback)
                    callback(metrics); // Return the metrics
            });
        });
    }
}

module.exports = MetricDiscovery;