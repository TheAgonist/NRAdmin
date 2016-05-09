angular.module('account.generate', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.linuxWrapperResource', 'services.utility','ui.bootstrap', 'directives.serverError']);


angular.module('account.generate').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/generate', {
      templateUrl: 'account/generate/generate.tpl.html',
      controller: 'GenerateCtrl',
      title: 'Generate',
    });
}]);



angular.module('account.generate').controller('GenerateCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'linuxWrapperResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, SOCIAL){

    var submitForm = function(){
      console.log("ready");
      restResource.generate().then(function(data){
        console.log("generated");
      });
    };

    $scope.submit = function(){
      submitForm();
    };
  }
]);