angular.module('account.comments', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.commentResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.comments').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/comments', {
      templateUrl: 'account/comments/comments.tpl.html',
      controller: 'CommentsCtrl',
      title: 'Play',
      resolve: {
        accountDetails: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.getAccountDetails, function(reason){
              //rejected either user is unverified or un-authenticated
              redirectUrl = reason === 'unverified-client'? '/account/verification': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }]
      }
    });
}]);

angular.module('account.comments').controller('CommentsCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'commentResource', 'accountResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, accountResource, SOCIAL){
    songName = $location.$$search.songName;
    var submitDetailForm = function(){
      restResource.setComment($scope.comment);
    }

    $scope.submit = function(){
      submitDetailForm();
    }
  }
]);
