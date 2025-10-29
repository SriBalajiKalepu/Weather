(function () {
  'use strict';

  angular
    .module('weatherApp', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: '/',
        })
        .otherwise({ redirectTo: '/' });
    }]);
})();


