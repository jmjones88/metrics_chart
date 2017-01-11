"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('metrics-chart/adapters/application', ['exports', 'ember-data', 'ember'], function (exports, _emberData, _ember) {
    exports['default'] = _emberData['default'].JSONAPIAdapter.extend({
        //Change all the model names to _.json (to match current file name structure)
        pathForType: function pathForType(modelName) {
            return _ember['default'].String.underscore(modelName) + '.json';
        }
    });
});
define('metrics-chart/app', ['exports', 'ember', 'metrics-chart/resolver', 'ember-load-initializers', 'metrics-chart/config/environment'], function (exports, _ember, _metricsChartResolver, _emberLoadInitializers, _metricsChartConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _metricsChartConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _metricsChartConfigEnvironment['default'].podModulePrefix,
    Resolver: _metricsChartResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _metricsChartConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('metrics-chart/components/date-picker', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        highData: null,
        lowData: null,
        didReceiveAttrs: function didReceiveAttrs() {
            this._super.apply(this, arguments);
            //Assign the recieved attributes
            var data = this.get('data');
            this.highData = data.high_temps.content[0]._data;
            this.lowData = data.low_temps.content[0]._data;
        },
        didUpdateAttrs: function didUpdateAttrs() {
            this._super.apply(this, arguments);
            this.initializeDatePicker();
        },
        didRender: function didRender() {
            //Get the dates and put in array format, to set the start and end date
            this.initializeDatePicker();
        },
        initializeDatePicker: function initializeDatePicker() {
            //Sort the objects
            this.highData.weather.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });
            this.lowData.weather.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });
            var highLabels = this.highData.weather.map(function (data) {
                return data.date;
            });
            var lowLabels = this.lowData.weather.map(function (data) {
                return data.date;
            });
            var startDate = moment(highLabels[0]) <= moment(lowLabels[0]) ? moment(highLabels[0]) : moment(lowLabels[0]);
            var endDate = moment(highLabels[highLabels.length - 1]) >= moment(lowLabels[lowLabels.length - 1]) ? moment(highLabels[highLabels.length - 1]) : moment(lowLabels[lowLabels.length - 1]);
            //Save the reference to the current object
            var that = this;
            this.$('input[name="daterange"]').daterangepicker({
                locale: {
                    format: 'YYYY-MM-DD'
                },
                startDate: startDate,
                endDate: endDate
            }, function (start, end) {
                //On a date change, send the action to the action method
                that.sendAction('onDateChanged', { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') });
            });
        },
        actions: {
            onDateChanged: function onDateChanged(startDate, endDate) {
                this.set('startDate', startDate);
                this.set('endDate', endDate);
            },
            resetDateRange: function resetDateRange() {
                console.log('reset date called!');
            }
        }
    });
});
define('metrics-chart/components/full-range-button', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        actions: {
            onButtonClicked: function onButtonClicked() {
                this.sendAction('onButtonPressed');
            }
        }
    });
});
define('metrics-chart/components/main-chart', ['exports', 'ember', 'npm:chart.js'], function (exports, _ember, _npmChartJs) {
    var MainChartComponent = _ember['default'].Component.extend({
        chartDataService: _ember['default'].inject.service('chart-data'),
        data: null,
        highData: null,
        lowData: null,
        myChart: null,
        resetButtonClicked: false,
        didReceiveAttrs: function didReceiveAttrs() {
            this._super.apply(this, arguments);
            //Assign the recieved attributes
            this.data = this.get('data');
            //get the data from the model
            this.highData = this.data.high_temps.content[0]._data;
            this.lowData = this.data.low_temps.content[0]._data;
        },
        actions: {
            dateDidChange: function dateDidChange(params) {
                var _this = this;

                //Update the date range of the chart with the passed in values
                if (params.startDate && params.endDate) {
                    (function () {
                        var highData = [],
                            highLabels = [];
                        //Loop over each data set and find date in range
                        _this.highData.weather.forEach(function (data) {
                            if (data.date >= params.startDate && data.date <= params.endDate) {
                                //add to high data array
                                highData.push(data.high_temp);
                                highLabels.push(data.date);
                            }
                        });
                        var lowData = [],
                            lowLabels = [];
                        _this.lowData.weather.forEach(function (data) {
                            if (data.date >= params.startDate && data.date <= params.endDate) {
                                //add to high data array
                                lowData.push(data.low_temp);
                                lowLabels.push(data.date);
                            }
                        });
                        //Update the labels and update the chart
                        _this.myChart.data.labels = highLabels;
                        _this.myChart.data.datasets[0].data = highData;
                        _this.myChart.data.datasets[1].data = lowData;
                        _this.myChart.update();
                    })();
                }
            },
            resetDateRange: function resetDateRange() {
                //Update the variable, which will notify the child component
                _ember['default'].set(this, 'resetButtonClicked', true);
                this.setInitialChartData();
                _ember['default'].set(this, 'resetButtonClicked', false);
            }
        },
        didRender: function didRender() {
            //Only want this render event to fire when the chart doesn't exist
            if (this.myChart === null) {
                this.setInitialChartData();
            }
        },
        //Helper function to Initialize chart data
        setInitialChartData: function setInitialChartData() {
            var ctx = document.getElementById("myChart");
            //Build the data, starting from the labels
            //Sort the array data
            this.highData.weather.sort(function (a, b) {
                return moment(a.date) - moment(b.date);
            });
            this.lowData.weather.sort(function (a, b) {
                return moment(a.date) - moment(b.date);
            });
            var highLabels = this.highData.weather.map(function (data) {
                return data.date;
            });
            var highData = this.highData.weather.map(function (data) {
                return data.high_temp;
            });
            var lowLabels = this.lowData.weather.map(function (data) {
                return data.date;
            });
            var lowData = this.lowData.weather.map(function (data) {
                return data.low_temp;
            });
            //More of a theoretical comparison to pick which labels we shouild used based on min and maxes
            var labels = highLabels;
            if (moment(lowLabels[0]) < moment(highLabels[0]) && moment(lowLabels[lowLabels.length - 1]) > moment(highLabels[highLabels.length - 1])) {
                labels = lowLabels;
            }
            //Initialize the chart object
            this.myChart = new _npmChartJs['default'](ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "High Temperatures",
                        data: highData,
                        backgroundColor: "rgba(255,0,0,0.4)"
                    }, {
                        label: "Low Temperatures",
                        data: lowData,
                        backgroundColor: "rgba(0,0,255,0.6)"
                    }]
                }
            });
        }
    });

    exports['default'] = MainChartComponent;
});
define('metrics-chart/helpers/app-version', ['exports', 'ember', 'metrics-chart/config/environment'], function (exports, _ember, _metricsChartConfigEnvironment) {
  exports.appVersion = appVersion;
  var version = _metricsChartConfigEnvironment['default'].APP.version;

  function appVersion() {
    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('metrics-chart/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('metrics-chart/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('metrics-chart/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'metrics-chart/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _metricsChartConfigEnvironment) {
  var _config$APP = _metricsChartConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('metrics-chart/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('metrics-chart/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('metrics-chart/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('metrics-chart/initializers/export-application-global', ['exports', 'ember', 'metrics-chart/config/environment'], function (exports, _ember, _metricsChartConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_metricsChartConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _metricsChartConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_metricsChartConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('metrics-chart/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('metrics-chart/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('metrics-chart/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("metrics-chart/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('metrics-chart/models/temp-data-high', ['exports', 'ember-data'], function (exports, _emberData) {
    exports['default'] = _emberData['default'].Model.extend({
        name: _emberData['default'].attr('string'),
        weather: _emberData['default'].attr()
    });
});
define('metrics-chart/models/temp-data-low', ['exports', 'ember-data'], function (exports, _emberData) {
    exports['default'] = _emberData['default'].Model.extend({
        name: _emberData['default'].attr(),
        weather: _emberData['default'].attr()
    });
});
define('metrics-chart/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('metrics-chart/router', ['exports', 'ember', 'metrics-chart/config/environment'], function (exports, _ember, _metricsChartConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _metricsChartConfigEnvironment['default'].locationType,
    rootURL: _metricsChartConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.route('home', { path: '/' });
  });

  exports['default'] = Router;
});
define('metrics-chart/routes/home', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model() {
            //Hash the high data and low data
            return _ember['default'].RSVP.hash({
                high_temps: this.get('store').findAll('temp-data-high'),
                low_temps: this.get('store').findAll('temp-data-low')
            });
        }
    });
});
define('metrics-chart/serializers/temp-data-high', ['exports', 'ember-data'], function (exports, _emberData) {
   exports['default'] = _emberData['default'].JSONAPISerializer.extend({
      normalizeResponse: function normalizeResponse(store, primaryModelClass, payload) {
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
         return this._super.apply(this, arguments);
      }
   });
});
define('metrics-chart/serializers/temp-data-low', ['exports', 'ember-data'], function (exports, _emberData) {
    exports['default'] = _emberData['default'].JSONAPISerializer.extend({
        normalizeResponse: function normalizeResponse(store, primaryModelClass, payload) {
            //Since the data sent back is not in a JSON API format, this converts it into an expected format
            var json = payload.result.site;
            payload.data = {};
            payload.data.id = json.id;
            payload.data.type = 'temp-data-low';
            payload.data.attributes = {};
            payload.data.attributes.name = json.name;
            payload.data.attributes.weather = json.weather;
            delete payload.result;
            return this._super.apply(this, arguments);
        }
    });
});
define('metrics-chart/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define("metrics-chart/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "fJD/rqnf", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "metrics-chart/templates/application.hbs" } });
});
define("metrics-chart/templates/components/date-picker", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "GkEr37Ky", "block": "{\"statements\":[[\"text\",\"Date Range: \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"type\",\"text\"],[\"static-attr\",\"class\",\"date-range\"],[\"static-attr\",\"name\",\"daterange\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "metrics-chart/templates/components/date-picker.hbs" } });
});
define("metrics-chart/templates/components/full-range-button", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Nb3URPdN", "block": "{\"statements\":[[\"open-element\",\"button\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"onButtonClicked\"]],[\"flush-element\"],[\"text\",\"Show Full Range\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "metrics-chart/templates/components/full-range-button.hbs" } });
});
define("metrics-chart/templates/components/main-chart", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "DiSec/TT", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"canvas\",[]],[\"static-attr\",\"id\",\"myChart\"],[\"static-attr\",\"width\",\"400\"],[\"static-attr\",\"height\",\"400\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"data\",\"onDateChanged\",\"resetButtonClicked\"],[[\"get\",[\"data\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"dateDidChange\"],null],[\"get\",[\"resetButtonClicked\"]]]]],false],[\"text\",\"\\n    \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"append\",[\"helper\",[\"full-range-button\"],null,[[\"onButtonPressed\"],[[\"helper\",[\"action\"],[[\"get\",[null]],\"resetDateRange\"],null]]]],false],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "metrics-chart/templates/components/main-chart.hbs" } });
});
define("metrics-chart/templates/home", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "5Aj7I52U", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Metrics Chart\"],[\"close-element\"],[\"text\",\"\\n     \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"main-chart\"],null,[[\"data\"],[[\"get\",[\"model\"]]]]],false],[\"text\",\"\\n     \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "metrics-chart/templates/home.hbs" } });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('metrics-chart/config/environment', ['ember'], function(Ember) {
  var prefix = 'metrics-chart';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("metrics-chart/app")["default"].create({"name":"metrics-chart","version":"0.0.0+b9f00011"});
}

/* jshint ignore:end */
//# sourceMappingURL=metrics-chart.map
