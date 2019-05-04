const Counter = require('./Prometheus/Counter');

/**
 * GuildMetric
 * This is the base class all metrics regarding to Guilds use.
 * Normally, a metric doesn't have to override the constructor() method.
 * Both create() and update() can be overridden whenever necessary.
 * In the create() method, you usually define all metrics. it is called when the metric is added to a Guild. This means a metric can have multiple instances, each for 1 Guild.
 * The update() method is called every time Prometheus requests statistics. If you have metrics that are updated on-demand, they can be updated here.
 */
class GuildMetric {
    /**
     * Constructor
     * @param {Discord.Guild} guild - The Guild the metric is connecting to
     * @param {EventEmitter} guildEvents - Instance where all Guild related events are fired from
     * @param {Object} prometheus - A JSON object containing the Node.JS Prometheus export objects
     */
    constructor(guild, guildEvents, prometheus) {
        this.guild = guild;
        this.guildEvents = guildEvents;
        this.prometheus = prometheus;
        this.metrics = {};
    }

    /**
     * Called when adding the metric to a new Guild
     * @param {function} callback
     */
    create(callback) {
        if (callback)
            callback();
    }

    /**
     * Called when Prometheus is requesting metrics for the Guild
     * @param {function} callback
     */
    update(callback) {
        if (callback)
            callback();
    }

    /**
     * Add a new counter metric
     * @param {Object} opts - The options for the metric
     * @param {function} callback - Callback for when the metric is done initializing
     * @param {Boolean} persist - If the metric should be persistent through restarts (default: true)
     * @protected
     */
    _addCounter(opts, callback=null, persist=true) {
        let promCounter = new this.prometheus.client.Counter(opts);
        this.metrics[opts.name] = new Counter(promCounter, this.guild, persist);
    }
}

module.exports = GuildMetric;