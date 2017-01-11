import Ember from 'ember';

export default Ember.Route.extend({
    model() {
        //Hash the high data and low data
        return Ember.RSVP.hash({
            high_temps: this.get('store').findAll('temp-data-high'),
            low_temps: this.get('store').findAll('temp-data-low')
        });
    }
});
