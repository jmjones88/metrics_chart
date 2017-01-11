import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
     normalizeResponse(store, primaryModelClass, payload) {
        //Since the data sent back is not in a JSON API format, this converts it into an expected format
        var json = payload.result.site;
        payload.data = {};
        payload.data.id = json.id;
        payload.data.type = 'temp-data-high';
        payload.data.attributes = {};
        payload.data.attributes.name = json.name;
        payload.data.attributes.weather = json.weather;
        //Remove the result, as it is no longer needed
        delete payload.result;
        return this._super(...arguments);
     }
});
