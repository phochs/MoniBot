class HoTStoreOutputter {
    constructor(HoTStore) {
        this.HoTStore = HoTStore;
    }

    /**
     * Export metrics compatible with Prometheus
     * @return {Array}
     */
    promClient() {
        // Create the output object template
        let returnTemplate = this._createReturnTemplate();

        let returnList = [];

        for (let labelSet in this.HoTStore.store) {
            if (this.HoTStore.store.hasOwnProperty(labelSet)) {
                let labels = labelSet.split('||');
                let HoT = this._clone(returnTemplate);

                for(let key in labels) {
                    HoT.labels[HoT.labelNames[key]] = labels[key];
                }

                HoT.hits = this.HoTStore.store[labelSet].getHits();

                returnList.push(HoT);
            }
        }

        return returnList;
    }

    /**
     * Create the return template for Prometheus exports
     * @return {{hits: number, labelNames: Array, labels: {}}}
     * @protected
     */
    _createReturnTemplate() {
        let returnTemplate = {
            labels: {},
            labelNames: [],
            hits: 0,
        };

        for (let i = 0; i < this.HoTStore.labels.length; i++) {
            returnTemplate.labels[this.HoTStore.labels[i]] = null;
            returnTemplate.labelNames.push(this.HoTStore.labels[i]);
        }

        return returnTemplate;
    }

    /**
     * Clone a JSON object
     * @param object
     * @return {object}
     * @protected
     */
    _clone(object) {
        return JSON.parse(JSON.stringify(object));
    }
}

module.exports = HoTStoreOutputter;