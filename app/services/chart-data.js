import Ember from 'ember';

export default Ember.Service.extend({
    //Create a holder for the data we are going to get
    high_data: null,
    low_data: null,
    init() {
        this.high_data = [];
        this.low_data = [];
    }
});
