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
        let highLabels = this.highData.weather.map(function(data) {
            return data.date;
        });
        let lowLabels = this.lowData.weather.map(function(data) {
            return data.date;
        });
        this.$('input[name="daterange"]').data('daterangepicker').setStartDate(moment(highLabels[0]));
        this.$('input[name="daterange"]').data('daterangepicker').setEndDate(moment(highLabels[highLabels.length - 1]));
     },
    didRender() {
        //Get the dates and put in array format, to set the start and end date
        let highLabels = this.highData.weather.map(function(data) {
            return data.date;
        });
        let lowLabels = this.lowData.weather.map(function(data) {
            return data.date;
        });
        //Save the reference to the current object
        var that = this;
        this.$('input[name="daterange"]').daterangepicker(
            {
                locale: {
                    format: 'YYYY-MM-DD'
                },
                startDate: highLabels[0],
                endDate: highLabels[highLabels.length - 1]
            },
            function(start, end, label) {
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
