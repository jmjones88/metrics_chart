import Ember from 'ember';

export default Ember.Component.extend({
    highData: null,
    lowData: null,
     didReceiveAttrs() {
        this._super(...arguments);
        //Assign the recieved attributes
        let data = this.get('data');
        this.highData = data.high_temps.content[0]._data;
        this.lowData = data.low_temps.content[0]._data;
    },
     didUpdateAttrs() {
        this._super(...arguments);
        this.initializeDatePicker();
     },
    didRender() {
        //Get the dates and put in array format, to set the start and end date
        this.initializeDatePicker();
    },
    initializeDatePicker() {
        //Sort the objects
        this.highData.weather.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });
        this.lowData.weather.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });
        let highLabels = this.highData.weather.map(function(data) {
            return data.date;
        });
        let lowLabels = this.lowData.weather.map(function(data) {
            return data.date;
        });
        let startDate = moment(highLabels[0]) <= moment(lowLabels[0]) ? moment(highLabels[0]) : moment(lowLabels[0]);
        let endDate = moment(highLabels[highLabels.length - 1]) >= moment(lowLabels[lowLabels.length - 1]) ? moment(highLabels[highLabels.length - 1]) : moment(lowLabels[lowLabels.length - 1]);
        //Save the reference to the current object
        var that = this;
        this.$('input[name="daterange"]').daterangepicker(
            {
                locale: {
                    format: 'YYYY-MM-DD'
                },
                startDate: startDate,
                endDate: endDate
            },
            function(start, end) {
                //On a date change, send the action to the action method
                that.sendAction('onDateChanged', 
                {startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD')});
            }
        );
    },
    actions: {
        onDateChanged(startDate, endDate) {
            this.set('startDate', startDate);
            this.set('endDate', endDate);
        },
        resetDateRange() {
            console.log('reset date called!');
        }
    }
});
