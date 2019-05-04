const Metric = require('../GuildMetric');
const async = require('async');

/**
 * MembersMetric
 * Collects metrics of Guild members
 */
class MembersMetric extends Metric {
    /**
     * Called when adding the metric to a new Guild
     * @param {function} callback
     */
    create(callback) {
        this.membersStats = {};
        this.presence = {};
        this.games = {};
        this.voiceChat = {};

        try {
            this.membersPresenceGauge = new this.prometheus.client.Gauge({
                name: 'discord_members_presence_total',
                help: 'Total Discord users grouped by presence',
                labelNames: ['presence'],
            });
            this.prometheus.register.registerMetric(this.membersPresenceGauge);

            this.membersGamesGauge = new this.prometheus.client.Gauge({
                name: 'discord_members_games_total',
                help: 'Total Discord users playing games, grouped by game',
                labelNames: ['game'],
            });
            this.prometheus.register.registerMetric(this.membersGamesGauge);

            this.channelsVoiceGauge = new this.prometheus.client.Gauge({
                name: 'discord_channels_voice_total',
                help: 'Total Discord users in voice chat, grouped by channel',
                labelNames: ['channel'],
            });
            this.prometheus.register.registerMetric(this.channelsVoiceGauge);

            this.totalMembersGauge = new this.prometheus.client.Gauge({
                name: 'discord_members_total',
                help: 'Discord total users in Guild',
            });
            this.prometheus.register.registerMetric(this.totalMembersGauge);

            this._loopMembers();
            this._listenEvents();
        } catch (e) {
            console.error('Error while creating metrics for membersMetric');
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
        // Presence
        this.presence = {
            online: 0,
            offline: 0,
            idle: 0,
            dnd: 0,
            bot: 0,
            deleted: 0,
        };

        this.games = {};

        this.voiceChat = {};

        async.series([
            /*
             * Process voice channels
             */
            callback => {
                this._updateVoice(callback);
            },
            /*
             * Process member stats
             */
            callback => {
                this._updateMembers(callback);
            },
            /*
             * Process the output
             */
            callback => {
                this._processOutput(callback);
            },
        ], () => {
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

            if (callback)
                callback();
        });
    }

    /**
     * Update all member statistics
     * @param {function} callback
     * @protected
     */
    _updateMembers(callback) {
        async.each(this.membersStats, (memberStats, callback) => {
            this.presence[memberStats.status]++;


            if (typeof this.games[memberStats.game] === 'undefined')
                this.games[memberStats.game] = 0;
            this.games[memberStats.game]++;

            callback();
        }, err => {
            if (err)
                console.error(err);

            if (callback)
                callback();
        });
    }

    /**
     * Process the updated output by adding it to the Prometheus statistics
     * @param {function} callback
     * @protected
     */
    _processOutput(callback) {
        this.membersPresenceGauge.reset();
        for (let key in this.presence) {
            if (this.presence.hasOwnProperty(key)) {
                this.membersPresenceGauge.set({presence: key}, this.presence[key]);
            }
        }

        this.membersGamesGauge.reset();
        for (let key in this.games) {
            if (this.games.hasOwnProperty(key)) {
                this.membersGamesGauge.set({game: key}, this.games[key]);
            }
        }

        this.channelsVoiceGauge.reset();
        for (let key in this.voiceChat) {
            if (this.voiceChat.hasOwnProperty(key)) {
                this.channelsVoiceGauge.set({channel: key}, this.voiceChat[key]);
            }
        }

        // Total
        this.totalMembersGauge.set(this.guild.memberCount);

        if (callback)
            callback();
    }

    /**
     * Loop through all members of a Guild
     * @param {function?} callback - Called when all members are parsed
     * @protected
     */
    _loopMembers(callback=null) {
        async.each(this.guild.members.values(), (member, callback) => {
            this._parseMember(member, callback);
        }, err => {
            if (err)
                console.error(err);

            if (callback)
                callback();
        });
    }

    /**
     * Update a single member of the Guild
     * @param {Discord.GuildMember} guildMember - the Guild member
     * @param {function?} callback - Called when the member is parsed
     * @protected
     */
    _parseMember(guildMember, callback=null) {
        let memberStats = {
            status: '',
            game: '',
            voiceChannel: '',
        };

        // Presence
        memberStats.status = guildMember.presence.status;

        if (guildMember.deleted)
            memberStats.status = 'deleted';
        if (guildMember.user.bot)
            memberStats.status = 'bot';

        // Game
        let game = guildMember.presence.game;
        memberStats.game = '';

        if (game !== null)
            memberStats.game = game.name;

        // Voice channel
        let voiceChannel = guildMember.voiceChannel;

        if (typeof voiceChannel !== 'undefined')
            memberStats.voiceChannel = voiceChannel.name;

        // Save
        let memberId = guildMember.id;
        this.membersStats[memberId] = memberStats;

        if (callback)
            callback();
    }

    /**
     * Add event listeners for member updates
     * @protected
     */
    _listenEvents() {
        this.guildEvents.on('guildMemberAdd', guildMember => {
            this._parseMember(guildMember);
        });
        this.guildEvents.on('guildMemberAvailable', guildMember => {
            this._parseMember(guildMember);
        });
        this.guildEvents.on('guildMembersChunk', guildMember => {
            this._parseMember(guildMember);
        });
        this.guildEvents.on('guildMemberUpdate', guildMember => {
            this._parseMember(guildMember);
        });
        this.guildEvents.on('presenceUpdate', guildMember => {
            this._parseMember(guildMember);
        });
    }
}

module.exports = MembersMetric;