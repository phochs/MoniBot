let moment = require('moment');

/**
 * HitsOverTime
 * Keeps track over the amount of hits between now and a defined period.
 * This gives the sum of hits over the defined period.
 * Every time a hit is registered on a particular second, it clears the old value and starts counting for the current second.
 */
class HitsOverTime {
    /**
     * @param {Number} seconds - The history to count in seconds. If you want to get the hits over the last minute, use 60. For the last hour, use 3600.
     */
    constructor(seconds) {
        if (typeof seconds !== 'number')
            throw 'Parameter `seconds` is not of type Number';

        this.seconds = seconds;
        this.currentSecond = null;
        this.initTime = moment().set('millisecond', 0);
        this.statsArray = [];

        this._createList(seconds);
        this._runHistoricTimer();
    }

    /**
     * Creates the list to keep track of the history.
     * @param {Number} seconds
     * @protected
     */
    _createList(seconds) {
        for (let i = 0; i < seconds; i++) {
            this.statsArray.push(0);
        }
    }

    /**
     * Get the current index, which is the current second to store the statistics in.
     * @return {number} second - The current second to use as the array index.
     * @protected
     */
    _getIndex() {
        return moment().diff(this.initTime, 'second') % this.seconds;
    }

    /**
     * Clears the old value from the stack.
     * @protected
     */
    _clearHistoricValue() {
        let index = this._getIndex();

        if (index !== this.currentSecond) {
            this.statsArray[index] = 0;
            this.currentSecond = index;
        }
    }

    /**
     * Sets a schedule to erase the old values periodically.
     * This runs 2x per second to ensure seconds are always erased.
     * @protected
     */
    _runHistoricTimer() {
        setInterval(() => {
            this._clearHistoricValue();
        }, 500);
    }

    /**
     * Register a hit.
     * @param {Number} [inc=1] - The amount of hits that should be added. Default: 1
     */
    hit(inc = 1) {
        if (typeof inc !== 'number')
            throw 'Parameter `inc` is not of type Number';

        this._clearHistoricValue();

        let index = this._getIndex();

        this.statsArray[index] = this.statsArray[index] + inc;
    }

    /**
     * Get the hits over the defined period.
     * @return {Number} hits
     */
    getHits() {
        return this.statsArray.reduce(this._arrayAdd);
    }

    /**
     * Internal method to add items of an array together
     * @param {Number} accumulator
     * @param {Number} a
     * @return {Number}
     * @protected
     */
    _arrayAdd(accumulator, a) {
        return accumulator + a;
    }
}

module.exports = HitsOverTime;