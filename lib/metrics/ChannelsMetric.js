const Metric = require('../GuildMetric');
const async = require('async');

/**
 * ChannelsMetric
 * Collects metrics of Guild channels
 */
class ChannelsMetric extends Metric {
    /**
     * Called when adding the metric to a new Guild
     * @param {function} callback
     */
    create(callback) {
        try {
            this.voiceChat = {};

            this.channelsGauge = new this.prometheus.client.Gauge({
                name: 'discord_channels_total',
                help: 'Discord total channels, grouped by type',
                labelNames: ['type'],
            });
            this.prometheus.register.registerMetric(this.channelsGauge);

            this.channelsVoiceGauge = new this.prometheus.client.Gauge({
                name: 'discord_channels_voice_total',
                help: 'Total Discord users in voice chat, grouped by channel',
                labelNames: ['channel'],
            });
            this.prometheus.register.registerMetric(this.channelsVoiceGauge);
        } catch (e) {
            console.error('Error while creating metrics for ChannelsMetric');
            console.error(e);
            console.error(this.guild);
        }

        callback();
    }

    /**
     * Called when Prometheus is requesting metrics for the Guild
     * @param {function} callback
     */
    update(callback) {
        if (this.channelsGauge && this.channelsVoiceGauge) {
            this.voiceChat = {};

            async.series([
                callback => {
                    this._updateChannels(callback);
                },
                callback => {
                    this._updateVoice(callback);
                },
            ], err => {
                if (err)
                    console.error(err);

                if (callback)
                    callback();
            });
        } else {
            callback();
        }
    }

    /**
     * Updates metric information of all channels available in the Guild (and the bot can see)
     * @param {function} callback
     * @protected
     */
    _updateChannels(callback) {
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
        }, () => {
            this.channelsGauge.reset();
            for (let key in type) {
                if (type.hasOwnProperty(key)) {
                    this.channelsGauge.set({type: key}, type[key]);
                }
            }

            if (callback)
                callback();
        });
    }

    /**
     * Update all voice channels of the Guild
     * @param {function} callback
     * @protected
     */
    _updateVoice(callback) {
        async.each(this.guild.channels.values(), (channel, callback) => {
            if(channel.type === 'voice') {
                if (typeof this.voiceChat[channel.name] === 'undefined')
                    this.voiceChat[channel.name] = 0;

                async.each(channel.members.values(), (member, callback) => {
                    this.voiceChat[channel.name]++;
                    callback();
                }, () => {
                    callback();
                });
            }
            else {
                callback();
            }
        }, err => {
            if (err)
                console.error(err);

            this.channelsVoiceGauge.reset();
            for (let key in this.voiceChat) {
                if (this.voiceChat.hasOwnProperty(key)) {
                    this.channelsVoiceGauge.set({channel: key}, this.voiceChat[key]);
                }
            }

            if (callback)
                callback();
        });
    }
}

module.exports = ChannelsMetric;