/**
 * MoniBot is a Discord bot, which provides metrics for Prometheus-compatible monitoring systems.
 * Prometheus is setup in such a way that IT always contacts the metric provider.
 * That means this bot needs to be reachable from the internet. The default port for Prometheus is 9100, but this is adjustable using the configuration file.
 *
 * If you can think of other metrics that could be interesting or useful, let us know!
 */

const MoniBot = require('./lib/MoniBot');

let moniBot = new MoniBot();
moniBot.run();