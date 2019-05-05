const promClient = require('prom-client');
const Registry = promClient.Registry;
const async = require('async');
const MetricDiscovery = require('./MetricDiscovery');
const EventEmitter = require('events');

/**
 * Guild
 * Wrapper class for a single Guild. This handles all communication to and from the Guild, and contains the metrics for that Guild.
 */
class Guild {
    /**
     * Constructor
     * @param {Config} config - The bot configuration
     */
    constructor(config) {
        this.guild = null;
        this.config = config;
        this.metrics = [];
        this.guildEvents = null;

        this.prometheus = null;
    }

    /**
     * Set the Guild and create everything required
     * @param {Discord.Guild} guild - The Guild instance received from Discord.JS
     */
    setGuild(guild) {
        this.guild = guild;
        this.guildEvents = new EventEmitter();

        this.prometheus = {
            client: promClient,
            collectDefaultMetrics: promClient.collectDefaultMetrics,
            register: new Registry(),
        };
        this.prometheus.collectDefaultMetrics({register: this.prometheus.register});

        this._addMetrics();

        if (this.config.config.nicknames) {
            if (typeof this.config.config.nicknames[this.guild.id] !== 'undefined') {
                this.guild.setName(this.config.config.nicknames[this.guild.id]);
            }
        }

        console.log('Connected to Guild ' + this.guild.name + ' with ID ' + this.guild.id);
    }

    /**
     * Get the name of the Guild
     * @return {string}
     */
    getName() {
        return this.guild.name;
    }

    /**
     * get the ID of the Guild
     * @return {string}
     */
    getId() {
        return this.guild.id.toString();
    }

    /**
     * Get a Prometheus-compatible string of all updated metrics
     * @param {PromDataCallback=} callback
     */
    getMetrics(callback) {
        this._updateMetrics(() => {
            if (callback)
                callback(this.prometheus.register.contentType, this.prometheus.register.metrics());
        });
    }

    /**
     * Update the metrics for the Guild
     * @param {function=} callback
     * @protected
     */
    _updateMetrics(callback) {
        async.each(this.metrics, this._updateMetric, err => {
            if (err)
                console.error(err);

            if(callback)
                callback();
        });
    }

    /**
     * Update a single metric instance
     * @param {GuildMetric} metric - The metric instance
     * @param {function} callback - Called when updating is completed
     * @protected
     */
    _updateMetric(metric, callback) {
        metric.update(callback);
    }

    /**
     * Add all available metrics to the Guild
     * @protected
     */
    _addMetrics() {
        MetricDiscovery.findMetrics(metrics => {
            async.each(metrics, (Metric, callback) => {
                this._addMetric(Metric, callback);
            }, err => {
                if (err)
                    console.error(err);
            });
        });
    }

    /**
     * Add a single metric to the Guild
     * @param {GuildMetric} Metric - The metric class
     * @param {function=} callback - Called when adding and creating of the metric is completed
     * @protected
     */
    _addMetric(Metric, callback) {
        let metric = new Metric(this.guild, this.guildEvents, this.prometheus);
        metric.create(() => { // Initialize the metric instance

            this.metrics.push(metric);
            if(callback)
                callback();
        });
    }
}

module.exports = Guild;

/**
 * Prometheus data callback
 * @callback PromDataCallback
 * @param {string} contentType
 * @param {string} metrics
 */
