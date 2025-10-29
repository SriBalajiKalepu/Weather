(function () {
  'use strict';

  angular.module('weatherApp').component('searchBox', {
    bindings: {
      onSearch: '&'
    },
    controller: function () {
      var vm = this;
      vm.city = '';

      vm.submit = function () {
        if (!vm.city) return;
        vm.onSearch({ city: vm.city });
      };
    },
    template: [
      '<div class="card">',
      '  <div class="title">Search City</div>',
      '  <div class="row">',
      '    <input type="text" ng-model="$ctrl.city" placeholder="Enter city name (e.g., London)" />',
      '    <button ng-click="$ctrl.submit()" ng-disabled="!$ctrl.city">Search</button>',
      '  </div>',
      '</div>'
    ].join('')
  });
})();


