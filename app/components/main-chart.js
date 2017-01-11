import Ember from 'ember';
import Chart from 'npm:chart.js';
const MainChartComponent = Ember.Component.extend({
    chartDataService: Ember.inject.service('chart-data'),
    data: null,
    highData: null,
    lowData: null,
    myChart: null,
    resetButtonClicked: false,
    didReceiveAttrs() {
        this._super(...arguments);
        //Assign the recieved attributes
        this.data = this.get('data');
        //get the data from the model
        this.highData = this.data.high_temps.content[0]._data;
        this.lowData = this.data.low_temps.content[0]._data;
    },
    actions: {
         dateDidChange(params) {
             //Update the date range of the chart with the passed in values
             if(params.startDate && params.endDate) {
                 let highData = [], highLabels = [];
                 //Loop over each data set and find date in range
                 this.highData.weather.forEach((data) => {
                     if(data.date >= params.startDate && data.date <= params.endDate)
                     {
                         //add to high data array
                         highData.push(data.high_temp);
                         highLabels.push(data.date);
                     }
                });
                let lowData = [], lowLabels = [];
                this.lowData.weather.forEach((data) => {
                    if(data.date >= params.startDate && data.date <= params.endDate)
                     {
                         //add to high data array
                         lowData.push(data.low_temp);
                         lowLabels.push(data.date);
                     }
                });
                //Update the labels and update the chart
                this.myChart.data.labels = highLabels;
                this.myChart.data.datasets[0].data = highData;
                this.myChart.data.datasets[1].data = lowData;
                this.myChart.update();
             }
        },
        resetDateRange() {
            //Update the variable, which will notify the child component
            Ember.set(this, 'resetButtonClicked', true);
            this.setInitialChartData();
            Ember.set(this, 'resetButtonClicked', false);
        }
    },
    didRender() {
        //Only want this render event to fire when the chart doesn't exist
        if(this.myChart === null)
        {
            this.setInitialChartData();
        }
    },
    //Helper function to Initialize chart data
    setInitialChartData() {
        var ctx = document.getElementById("myChart");
        //Build the data, starting from the labels
        let highLabels = this.highData.weather.map(function(data) {
            return data.date;
        });
        let highData = this.highData.weather.map(function(data) {
            return data.high_temp;
        });
        let lowLabels = this.lowData.weather.map(function(data) {
            return data.date;
        });
        let lowData = this.lowData.weather.map(function(data) {
            return data.low_temp;
        });
        //Initialize the chart object
        this.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: highLabels,
                datasets: [
                    {
                        label: "High Temperatures",
                        data: highData,
                        backgroundColor: "rgba(255,0,0,0.4)"
                    },
                    {
                        label: "Low Temperatures",
                        data: lowData,
                        backgroundColor: "rgba(0,0,255,0.6)"
                    },
                ]
            }
        });
    }
});

export default MainChartComponent;

