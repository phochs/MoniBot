const Metric = require('../GuildMetric');
const Discord = require('discord.js');

/**
 * MessagesMetric
 * Collects metrics of Guild messages
 */
class MessagesMetric extends Metric {
    /**
     * Called when adding the metric to a new Guild
     * @param {function} callback
     */
    create(callback) {
        try {
            this.messagesSent = new this.prometheus.client.Counter({
                name: 'discord_messages_sent_total',
                help: 'Discord total messages sent, grouped by channel and user type',
                labelNames: ['channel', 'bot'],
            });
            this.prometheus.register.registerMetric(this.messagesSent);

            this.messagesDeleted = new this.prometheus.client.Counter({
                name: 'discord_messages_deleted_total',
                help: 'Discord total messages deleted, grouped by channel and user type',
                labelNames: ['channel', 'bot'],
            });
            this.prometheus.register.registerMetric(this.messagesDeleted);

            this.messagesEdited = new this.prometheus.client.Counter({
                name: 'discord_messages_edited_total',
                help: 'Discord total messages edited, grouped by channel and user type',
                labelNames: ['channel', 'bot'],
            });
            this.prometheus.register.registerMetric(this.messagesEdited);

            this.messageReactionsAdded = new this.prometheus.client.Counter({
                name: 'discord_message_reactions_added_total',
                help: 'Discord total reactions added, grouped by channel and user type',
                labelNames: ['channel', 'bot'],
            });
            this.prometheus.register.registerMetric(this.messageReactionsAdded);

            this.messageReactionsDeleted = new this.prometheus.client.Counter({
                name: 'discord_message_reactions_deleted_total',
                help: 'Discord total reactions deleted, grouped by channel and user type',
                labelNames: ['channel', 'bot'],
            });
            this.prometheus.register.registerMetric(this.messageReactionsDeleted);

            this.messageMentions = new this.prometheus.client.Counter({
                name: 'discord_message_mentions_total',
                help: 'Discord total mentions, grouped by channel, mention type and user type',
                labelNames: ['channel', 'type', 'bot'],
            });
            this.prometheus.register.registerMetric(this.messageMentions);

            this._listenEvents();
        } catch (e) {
            console.error('Error while creating metrics for MessagesMetric');
            console.error(e);
            console.error(this.guild);
        }

        callback();
    }

    /**
     * Add the event listeners
     * @protected
     */
    _listenEvents() {
        this.guildEvents.on('message', message => {
            try {
                let channel = this._getChannelName(message);

                this.messagesSent.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });

                this._parseMentions(message);
            } catch (e) {
                console.error('Error while processing event message in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });
        this.guildEvents.on('messageDelete', message => {
            try {
                let channel = this._getChannelName(message);

                this.messagesDeleted.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });
            } catch (e) {
                console.error('Error while processing event messageDelete in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });
        this.guildEvents.on('messageUpdate', message => {
            try {
                let channel = this._getChannelName(message);

                this.messagesEdited.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });

                this._parseMentions(message);
            } catch (e) {
                console.error('Error while processing event messageUpdate in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });
        this.guildEvents.on('messageDeleteBulk', message => {
            try {
                let channel = this._getChannelName(message);

                this.messagesDeleted.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });
            } catch (e) {
                console.error('Error while processing event messageDeleteBulk in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });

        this.guildEvents.on('messageReactionAdd', messageReaction => {
            try {
                let channel = this._getChannelName(messageReaction);

                this.messageReactionsAdded.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });
            } catch (e) {
                console.error('Error while processing event messageReactionAdd in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });
        this.guildEvents.on('messageReactionRemove', messageReaction => {
            try {
                let channel = this._getChannelName(messageReaction);

                this.messageReactionsDeleted.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });
            } catch (e) {
                console.error('Error while processing event messageReactionRemove in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });
        this.guildEvents.on('messageReactionRemoveAll', messageReaction => {
            try {
                let channel = this._getChannelName(messageReaction);

                this.messageReactionsDeleted.inc({
                    channel,
                    bot: this._isSentByBot(message),
                });
            } catch (e) {
                console.error('Error while processing event messageReactionRemoveAll in MessagesMetric');
                console.error(e);
                console.error(this.guild);
            }
        });
    }

    /**
     * Get the channel name from an event object
     * @param {Discord.Message|Discord.MessageReaction} obj - The object returned form an event
     * @return {string} - The channel name, or '' if there was none
     * @protected
     */
    _getChannelName(obj) {
        if (obj instanceof Discord.Message) {
            if (obj.channel instanceof Discord.TextChannel || obj.channel instanceof Discord.GroupDMChannel)
                return obj.channel.name;
        } else if (obj instanceof Discord.MessageReaction) {
            if (obj.message.channel instanceof Discord.TextChannel || obj.message.channel instanceof Discord.GroupDMChannel)
                return obj.message.channel.name;
        }

        return '';
    }

    /**
     * Check if a message or reaction was sent by a bot or not
     * @param {Discord.Message|Discord.MessageReaction} obj - The object returned form an event
     * @return {boolean}
     * @protected
     */
    _isSentByBot(obj) {
        if (obj instanceof Discord.Message) {
            return obj.member.user.bot;
        } else if (obj instanceof Discord.MessageReaction) {
            return obj.message.member.user.bot;
        }

        return false;
    }

    /**
     * Parse mentions from a message
     * @param {Discord.Message} message
     * @protected
     */
    _parseMentions(message) {
        let channel = this._getChannelName(message);

        let channels = message.mentions.channels.array().length;
        if (channels > 0) {
            this.messageMentions.inc({
                channel,
                type: 'channel',
            }, channels);
        }

        let members = message.mentions.members.array().length;
        if (members > 0) {
            this.messageMentions.inc({
                channel,
                type: 'member',
            }, members);
        }

        let roles = message.mentions.roles.array().length;
        if (roles > 0) {
            this.messageMentions.inc({
                channel,
                type: 'role',
            }, roles);
        }

        let users = message.mentions.users.array().length;
        if (users > 0) {
            this.messageMentions.inc({
                channel,
                type: 'user',
            }, users);
        }

        if (message.mentions.everyone) {
            this.messageMentions.inc({
                channel,
                type: 'everyone',
            });
        }
    }
}

module.exports = MessagesMetric;