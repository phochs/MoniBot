const HoT = require('./HitsOverTime');

class HoTStore {
    /**
     * @param {Array=} labels - A list with the names of all labels
     * @param {Number} [history=60] - The amount of history that should be kept in seconds
     */
    constructor(labels = [], history = 60) {
        this.store = {};

        if (labels.constructor === Array)
            this.labels = labels;
        else
            this.labels = [];

        this.history = parseInt(history);
        if (this.history < 1)
            this.history = 60;
    }

    /**
     * Sets the label names
     * @param {Array} labelNames - A list with the names of all labels
     */
    setLabels(labelNames) {
        if (labelNames.constructor === Array)
            this.labels = labelNames;
    }

    /**
     * Increases the hits for a set of labels with the given amount
     * @param {Array} labels - A list of the label values
     * @param {Number} [inc=1] - The amount this HoT should be increased
     */
    hit(labels, inc = 1) {
        let HoT = this._getHoT(labels);

        HoT.hit(inc);
    }

    /**
     * Converts a list of label values to the correct JSON object attribute name
     * @param {array} labels - A list of the label values
     * @return {string}
     * @protected
     */
    _labelsToIndex(labels) {
        return labels.join('||');
    }

    /**
     * Check if a HitsOverTime instance exists for the given label values
     * @param {Array} labels
     * @return {boolean}
     * @protected
     */
    _HoTExists(labels) {
        let index = this._labelsToIndex(labels);
        return typeof this.store[index] !== 'undefined';
    }

    /**
     * Create a new HitsOverTime instance for a set of label values
     * @param {Array} labels
     * @protected
     */
    _createHoT(labels) {
        let index = this._labelsToIndex(labels);

        this.store[index] = new HoT(this.history);
    }

    /**
     * Get the HitsOverTime instance for a set of label values
     * @param {Array} labels
     * @return {HoT}
     * @protected
     */
    _getHoT(labels) {
        if (!this._HoTExists(labels)) {
            this._createHoT(labels);
        }

        let index = this._labelsToIndex(labels);
        return this.store[index];
    }
}

module.exports = HoTStore;