(function () {
    'use strict';
  
    angular.module('weatherApp').factory('WeatherService', ['$http', function ($http) {
      // Dynamically set API base URL based on frontend's hostname
      var apiBase = (function() {
        var hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:4000/api';
        } else {
          return 'http://' + hostname + ':4000/api';
        }
      })();
  
      function getWeather(city) {
        return $http.get(apiBase + '/weather', { params: { city: city } })
          .then(function (res) { return res.data; });
      }
  
      function saveWeather(data) {
        return $http.post(apiBase + '/saveWeather', data)
          .then(function (res) { return res.data; });
      }
  
      return {
        getWeather: getWeather,
        saveWeather: saveWeather
      };
    }]);
  })();
  