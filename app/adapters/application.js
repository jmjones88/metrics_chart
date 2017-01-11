import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPIAdapter.extend({
    //Change all the model names to _.json (to match current file name structure)
    pathForType: function(modelName) {
      var dasherized = Ember.String.dasherize(modelName);
      return Ember.String.underscore(modelName) + '.json';
  }
});
