  angular.module('account.comments', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.commentResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.comments').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/comments', {
      templateUrl: 'account/comments/comments.tpl.html',
      controller: 'CommentsCtrl',
      title: 'Add comments',
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

angular.module('account.comments').controller('CommentsCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'commentResource', 'accountResource', 'SOCIAL', 'ngAudio',
  function($scope, $location, $log, security, utility, restResource, accountResource, SOCIAL, audio, router){
    /*var url = '/night.mp3';            
      $scope.audio = audio.load(url);
      $scope.audio.volume = 0.8;*/
    var send = {
      song: $location.$$search.songName
    };
    restResource.getComments(send).then(function(data){
      $scope.comments = data;
      console.log($scope);
    });

    var submitDetailForm = function(){
      console.log($scope);
      var send = {
        content: $scope.comment,
        song: $location.$$search.songName
      };
      console.log(send);
      restResource.setComment(send).then(function(){
        //console.log("ccc");
        //$location.href = "localhost:3000/account/comments";
      });
    };

    $scope.submit = function(){
      submitDetailForm();
    };
    $scope.redirect = function(record) {
      $location.url("account/sheetMusic?bufferName="+$location.$$search.songName);
    };
    var name = $location.$$search.songName.split(".")[0];
    $scope.songName = "/"+name+".mp3";
    console.log($scope.songName);
  }
]);
