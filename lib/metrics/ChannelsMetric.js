const Metric = require('../GuildMetric');
const async = require('async');

class ChannelsMetric extends Metric {
    create(callback) {
        try {
            this.channelsGauge = new this.prometheus.client.Gauge({
                name: 'discord_channels_total',
                help: 'Discord total channels, grouped by type',
                labelNames: ['type'],
            });
            this.prometheus.register.registerMetric(this.channelsGauge);
        } catch (e) {
            console.error('Error while creating metrics for ChannelsMetric');
            console.error(e);
            console.error(this.guild);
        }

        callback();
    }

    update(callback) {
        if(this.channelsGauge) {
            let type = {
                dm: 0,
                group: 0,
                text: 0,
                voice: 0,
                category: 0,
            };

            async.each(this.guild.channels.values(), (channel, callback) => {
                type[channel.type]++;

                callback();
            }, err => {
                for (let key in type) {
                    if (type.hasOwnProperty(key)) {
                        this.channelsGauge.set({type: key}, type[key]);
                    }
                }

                callback();
            });
        }
        else {
            callback();
        }
    }
}

module.exports = ChannelsMetric;