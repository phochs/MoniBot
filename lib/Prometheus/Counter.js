const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const async = require('async');

class Counter extends EventEmitter {
    constructor(counter, guild, persist) {
        super();

        this.counter = counter;
        this.guild = guild;
        this.persist = persist;

        this._setPersist();
    }

    _setPersist() {
        this.persistDir = path.join('data/persist', this.guild.id.toString());
        this.persistFile = path.join(this.persistDir, `${this.counter.name}.json`);
    }

    init(callback) {
        if (this.persist === true && fs.existsSync(this.persistFile)) {
            let data = require(this.persistFile);

            async.eachSeries(data, (metric, callback) => {
                if (typeof metric.value === 'number' && typeof metric.labels !== 'undefined') {
                    this.counter.inc(metric.labels, metric.value);
                }

                callback();
            }, err => {
                if (callback)
                    callback();
            });
        } else {
            if (callback)
                callback();
        }
    }

    inc(arg1 = null, arg2 = null) {
        if (typeof arg1 === 'number') {
            this.counter.inc(arg1);
        } else if (arg1 !== 'null') {
            
        }

        this.counter.inc();
    }
}

module.exports = Counter;