import DS from 'ember-data';
import Ember from 'ember';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({
    host: config.APP.rootURL,
    //Change all the model names to _.json (to match current file name structure)
    pathForType: function(modelName) {
      return Ember.String.underscore(modelName) + '.json';
  }
});
