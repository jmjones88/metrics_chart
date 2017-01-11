import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        onButtonClicked() {
            this.sendAction('onButtonPressed');
        }
    }
});
