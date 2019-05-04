const Metric = require('../GuildMetric');
const HoTStore = require('../HitsOverTime/HoTStore');
const HoTStoreOutputter = require('../HitsOverTime/HoTStoreOutputter');
const async = require('async');

class NetworkMetrics extends Metric {
    create(callback) {
        try {
            this.HoTStore = new HoTStore([
                'event'
            ], 60);
            this.HoTStoreOutputter = new HoTStoreOutputter(this.HoTStore);

            this.eventsReceived = new this.prometheus.client.Gauge({
                name: 'discord_events_received_total',
                help: 'Discord total events received last minute',
                labelNames: ['event'],
            });
            this.prometheus.register.registerMetric(this.eventsReceived);

            this.guildEvents.on('guildMemberAdd', () => {
                this.HoTStore.hit(['guildMemberAdd']);
            });
            this.guildEvents.on('guildMemberAvailable', () => {
                this.HoTStore.hit(['guildMemberAvailable']);
            });
            this.guildEvents.on('guildMembersChunk', () => {
                this.HoTStore.hit(['guildMembersChunk']);
            });
            this.guildEvents.on('guildMemberUpdate', () => {
                this.HoTStore.hit(['guildMemberUpdate']);
            });
            this.guildEvents.on('presenceUpdate', () => {
                this.HoTStore.hit(['presenceUpdate']);
            });
            this.guildEvents.on('message', () => {
                this.HoTStore.hit(['message']);
            });
            this.guildEvents.on('messageDelete', () => {
                this.HoTStore.hit(['messageDelete']);
            });
            this.guildEvents.on('messageUpdate', () => {
                this.HoTStore.hit(['messageUpdate']);
            });
            this.guildEvents.on('messageDeleteBulk', () => {
                this.HoTStore.hit(['messageDeleteBulk']);
            });

            this.guildEvents.on('messageReactionAdd', () => {
                this.HoTStore.hit(['messageReactionAdd']);
            });
            this.guildEvents.on('messageReactionRemove', () => {
                this.HoTStore.hit(['messageReactionRemove']);
            });
            this.guildEvents.on('messageReactionRemoveAll', () => {
                this.HoTStore.hit(['messageReactionRemoveAll']);
            });
        } catch (e) {
            console.error('Error while creating metrics for NetworkMetrics');
            console.error(e);
            console.error(this.guild);
        }

        if (callback)
            callback();
    }

    /**
     * Called when Prometheus is requesting metrics for the Guild
     * @param {function} callback
     */
    update(callback) {
        this.eventsReceived.reset();
        async.each(this.HoTStoreOutputter.promClient(), (prom, callback) => {
            this.eventsReceived.set(prom.labels, prom.hits);

            callback();
        }, err => {
            if (callback)
                callback();
        });
    }
}

module.exports = NetworkMetrics;