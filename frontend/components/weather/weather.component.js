(function () {
  'use strict';

  angular.module('weatherApp').component('weather', {
    controller: ['WeatherService', function (WeatherService) {
      var vm = this;
      vm.loading = false;
      vm.error = '';
      vm.weather = null;

      vm.handleSearch = function (city) {
        vm.error = '';
        vm.loading = true;
        vm.weather = null;
        WeatherService.getWeather(city)
          .then(function (data) {
            vm.weather = data;
          })
          .catch(function (err) {
            vm.error = (err && err.data && err.data.error) || 'Failed to fetch weather';
          })
          .finally(function () {
            vm.loading = false;
          });
      };

      vm.saveCurrent = function () {
        if (!vm.weather) return;
        WeatherService.saveWeather(vm.weather)
          .then(function () { alert('Weather saved to database!'); })
          .catch(function () { alert('Failed to save weather'); });
      };
    }],
    template: [
      '<search-box on-search="$ctrl.handleSearch(city)"></search-box>',
      '<div class="card" ng-if="$ctrl.loading">Loading...</div>',
      '<div class="card" ng-if="$ctrl.error && !$ctrl.loading">{{$ctrl.error}}</div>',
      '<div class="card" ng-if="$ctrl.weather && !$ctrl.loading">',
      '  <div class="title">Current Weather</div>',
      '  <div><strong>City:</strong> {{$ctrl.weather.cityName}}</div>',
      '  <div><strong>Temperature:</strong> {{$ctrl.weather.temperature}} °C</div>',
      '  <div><strong>Humidity:</strong> {{$ctrl.weather.humidity}} %</div>',
      '  <div><strong>Conditions:</strong> {{$ctrl.weather.conditions}}</div>',
      '  <div style="margin-top:12px;"><button ng-click="$ctrl.saveCurrent()">Save to MongoDB</button></div>',
      '</div>'
    ].join('')
  });
})();


