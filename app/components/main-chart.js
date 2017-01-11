import Ember from 'ember';
import Chart from 'npm:chart.js';
const MainChartComponent = Ember.Component.extend({
    chartDataService: Ember.inject.service('chart-data'),
    data: null,
    highData: null,
    lowData: null,
    myChart: null,
    didReceiveAttrs() {
        this._super(...arguments);
        //Assign the recieved attributes
        this.data = this.get('data');
        this.highData = this.data.high_temps;
        this.lowData = this.data.low_temps;
    },
    actions: {
         dateDidChange(params) {
             //Update the date range of the chart with the passed in values
             if(params.startDate && params.endDate) {
                 let highData = [], highLabels = [];
                 //Loop over each data set and find date in range
                 for(let data of this.highData.content[0]._data.weather) {
                     if(data.date >= params.startDate && data.date <= params.endDate)
                     {
                         //add to high data array
                         highData.push(data.high_temp);
                         highLabels.push(data.date);
                     }
                }
                let lowData = [], lowLabels = [];
                for(let data of this.lowData.content[0]._data.weather) {
                    if(data.date >= params.startDate && data.date <= params.endDate)
                     {
                         //add to high data array
                         lowData.push(data.low_temp);
                         lowLabels.push(data.date);
                     }
                }
                //Update the labels and update the chart
                this.myChart.data.labels = highLabels;
                this.myChart.data.datasets[0].data = highData;
                this.myChart.data.datasets[1].data = lowData;
                this.myChart.update();
             }
        },
        resetDateRange() {
            console.log("reset data range");
        }
    },
    didRender() {
        /*var blogPosts = store.find('data/temp_data_low.json');
        console.log(blogPosts); */
        var ctx = document.getElementById("myChart");
        //Build the data, starting from the labels
        let highLabels = this.highData.content[0]._data.weather.map(function(data) {
            return data.date;
        });
        let highData = this.highData.content[0]._data.weather.map(function(data) {
            return data.high_temp;
        });
        let lowLabels = this.lowData.content[0]._data.weather.map(function(data) {
            return data.date;
        });
        let lowData = this.lowData.content[0]._data.weather.map(function(data) {
            return data.low_temp;
        });
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

