import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
     normalizeResponse(store, primaryModelClass, payload) {
         //Since the data sent back is not in a JSON API format, this converts it into an expected format
         var json = payload.result.site;
         payload.data = {};
         payload.data.id = json.id;
         payload.data.type = 'temp-data-low';
         payload.data.attributes = {};
         payload.data.attributes.name = json.name;
         payload.data.attributes.weather = json.weather;
         delete payload.result;
         return this._super(...arguments);
     }
});
