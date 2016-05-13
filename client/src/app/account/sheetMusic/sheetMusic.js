angular.module('account.sheetMusic', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.linuxWrapperResource', 'services.utility','ui.bootstrap', 'directives.serverError']);


angular.module('account.sheetMusic').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/sheetMusic', {
      templateUrl: 'account/sheetMusic/sheetMusic.tpl.html',
      controller: 'SheetMusicCtrl',
      title: 'SheetMusic',
    });
}]);



angular.module('account.sheetMusic').controller('SheetMusicCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'linuxWrapperResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, SOCIAL){}
]);