const Discord = require('discord.js');
const async = require('async');
const Guild = require('./Guild');

/**
 * Container for all Guild objects. This also handles the communication to the Discord API, through Discord.JS
 */
class Guilds {
    /**
     * Constructor
     * @param {Config} config - The bot configuration
     */
    constructor(config) {
        this.guilds = {};
        this.config = config;
        this.client = null;
    }

    /**
     * Connect to the Discord API and when done, add the Guilds and event listeners.
     * @param {function=} callback - Called when connecting is completed. Does not get called when there was an error during connecting.
     */
    connect(callback) {
        this.client = new Discord.Client();

        this.client.login(this.config.config.token).then(() => {
            this.client.user.setActivity('github.com/phochs/MoniBot');

            this._setGuilds(this.client.guilds.values(), () => {
                if (callback)
                    callback();
            });

            this._listenRawEvents();
            this._listenSystemEvents();
            this._listenGuildEvents();
            this._listenMetricEvents();
        }).catch(e => {
            console.error('An error occurred while connecting');
            console.error(e);
        });
    }

    /**
     * Set the Guilds
     * @param {IterableIterator} guilds - A list of all Guilds the bot is connected to
     * @param {function=} callback - Called when setting the Guilds is completed
     * @protected
     */
    _setGuilds(guilds, callback) {
        async.each(guilds, (guild, callback) => {
            this._createGuild(guild);

            callback();
        }, (err) => {
            if (err)
                console.error(err);

            if(callback)
                callback();
        });
    }

    /**
     * Create a Guild wrapper from a Discord.JS Guild object
     * @param {Discord.Guild} guild - The Guild instance
     * @protected
     */
    _createGuild(guild) {
        try {
            if (typeof this.guilds[guild.id] === 'undefined') {
                let guildObj = new Guild(this.config);
                guildObj.setGuild(guild);

                this.guilds[guildObj.getId()] = guildObj;
            }
        } catch (e) {
            console.error('Error while creating Guild');
            console.error(e);
            console.error(guild);
        }
    }

    /**
     * Delete an existing Guild
     * @param {Discord.Guild} guild - The deleted Guild instance
     * @protected
     */
    _deleteGuild(guild) {
        try {
            let guildID = guild.id;

            delete this.guilds[guildID];
        } catch (e) {
            console.error('Error while deleting Guild');
            console.error(e);
            console.error(guild);
        }
    }

    /**
     * Add event listeners for all system related events
     * @protected
     */
    _listenSystemEvents() {
        this.client.on('reconnecting', number => {
            console.warn(`Lost connection, trying to reconnect (${number})`);
        });
        this.client.on('resume', number => {
            console.info(`Connection has been re-established (${number})`);
        });
        this.client.on('disconnect', closeEvent => {
            console.error(`Lost connection, NOT trying to reconnect. Please check your connection and restart the bot.`);
            console.error(closeEvent);
        });
        this.client.on('warn', warning => {
            console.warn(`Received a warning:`);
            console.warn(warning);
        });
        this.client.on('error', error => {
            console.error(`Received an error:`);
            console.error(error);
        });
    }

    /**
     * Add event listeners for all events having to do with the Guilds itself
     * @protected
     */
    _listenGuildEvents() {
        this.client.on('guildCreate', guild => {
            try {
                this._createGuild(guild);
            } catch (e) {
                console.error('Error while creating a new Guild');
                console.error(e);
                console.error(guild);
            }
        });
        this.client.on('guildDelete', guild => {
            try {
                this._deleteGuild(guild);
            } catch (e) {
                console.error('Error while deleting a new Guild');
                console.error(e);
                console.error(guild);
            }
        });
    }

    /**
     * Add event listeners for all events used somewhere within the metrics.
     * These events get forwarded to the appropriate Guild wrapper.
     * @protected
     */
    _listenMetricEvents() {
        // Member
        this.client.on('guildMemberAdd', guildMember => {
            try {
                this._passEvent('guildMemberAdd', guildMember);
            } catch (e) {
                console.error('Error while passing on event guildMemberAdd');
                console.error(e);
                console.error(guildMember);
            }
        });
        this.client.on('guildMemberAvailable', guildMember => {
            try {
                this._passEvent('guildMemberAvailable', guildMember);
            } catch (e) {
                console.error('Error while passing on event guildMemberAvailable');
                console.error(e);
                console.error(guildMember);
            }
        });
        this.client.on('guildMembersChunk', guildMembers => {
            try {
                async.each(guildMembers, (guildMember, callback) => {
                    this._passEvent('guildMembersChunk', guildMember);
                    callback();
                }, err => {
                    if (err)
                        console.error(err);
                });
            } catch (e) {
                console.error('Error while passing on event guildMembersChunk');
                console.error(e);
                console.error(guildMembers);
            }
        });
        this.client.on('guildMemberUpdate', guildMember => {
            try {
                this._passEvent('guildMemberUpdate', guildMember);
            } catch (e) {
                console.error('Error while passing on event guildMemberUpdate');
                console.error(e);
                console.error(guildMember);
            }
        });
        this.client.on('presenceUpdate', (oldGuildMember, newGuildMember) => {
            try {
                this._passEvent('presenceUpdate', newGuildMember);
            } catch (e) {
                console.error('Error while passing on event presenceUpdate');
                console.error(e);
                console.error(newGuildMember);
            }
        });

        // Message
        this.client.on('message', message => {
            try {
                this._passEvent('message', message);
            } catch (e) {
                console.error('Error while passing on event message');
                console.error(e);
                console.error(message);
            }
        });
        this.client.on('messageDelete', message => {
            try {
                this._passEvent('messageDelete', message);
            } catch (e) {
                console.error('Error while passing on event messageDelete');
                console.error(e);
                console.error(message);
            }
        });
        this.client.on('messageDeleteBulk', messages => {
            try {
                async.each(messages, (message, callback) => {
                    this._passEvent('messageDeleteBulk', message);
                    callback();
                }, err => {
                    if (err)
                        console.error(err);
                });
            } catch (e) {
                console.error('Error while passing on event messageDeleteBulk');
                console.error(e);
                console.error(messages);
            }
        });
        this.client.on('messageReactionAdd', messageReaction => {
            try {
                this._passEvent('messageReactionAdd', messageReaction);
            } catch (e) {
                console.error('Error while passing on event messageReactionAdd');
                console.error(e);
                console.error(messageReaction);
            }
        });
        this.client.on('messageReactionRemove', messageReaction => {
            try {
                this._passEvent('messageReactionRemove', messageReaction);
            } catch (e) {
                console.error('Error while passing on event messageReactionRemove');
                console.error(e);
                console.error(messageReaction);
            }
        });
        this.client.on('messageReactionRemoveAll', messages => {
            try {
                this._passEvent('messageReactionRemoveAll', messages);
            } catch (e) {
                console.error('Error while passing on event messageReactionRemoveAll');
                console.error(e);
                console.error(messages);
            }
        });
        this.client.on('messageUpdate', (oldMessages, newMessage) => {
            try {
                this._passEvent('messageUpdate', newMessage);
            } catch (e) {
                console.error('Error while passing on event messageUpdate');
                console.error(e);
                console.error(newMessage);
            }
        });
    }

    /**
     * Some events only work as raw events, this is where those get parsed
     * @protected
     */
    _listenRawEvents() {
        const events = {
            MESSAGE_REACTION_ADD: 'messageReactionAdd',
            MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
        };

        this.client.on('raw', async event => {
            if (!events.hasOwnProperty(event.t)) return;

            const { d: data } = event;
            const user = this.client.users.get(data.user_id);
            const channel = this.client.channels.get(data.channel_id) || await user.createDM();

            if (channel.messages.has(data.message_id)) return;

            const message = await channel.fetchMessage(data.message_id);
            const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
            let reaction = message.reactions.get(emojiKey);

            if (!reaction) {
                const emoji = new Discord.Emoji(this.client.guilds.get(data.guild_id), data.emoji);
                reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === this.client.user.id);
            }

            this.client.emit(events[event.t], reaction, user);
            //this._passEvent('events[event.t]', reaction);
        });
    }

    /**
     * Forward an event to the appropriate Guild wrapper.
     * @param {string} eventName - The name of the event
     * @param {Discord.GuildMember|Discord.Message|Discord.MessageReaction} event - The event object
     * @protected
     */
    _passEvent(eventName, event) {
        if (event instanceof Discord.GuildMember || event instanceof Discord.Message) {
            let guildId = event.guild.id;

            if (typeof this.guilds[guildId] !== 'undefined') {
                this.guilds[guildId].guildEvents.emit(eventName, event);
            }
        }
        if (event instanceof Discord.MessageReaction) {
            let guildId = event.message.guild.id;

            if (typeof this.guilds[guildId] !== 'undefined') {
                this.guilds[guildId].guildEvents.emit(eventName, event);
            }
        }
    }
}

module.exports = Guilds;