angular.module('account.play', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.recordResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.play').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/play', {
      templateUrl: 'account/play/play.tpl.html',
      controller: 'PlayCtrl',
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
        }],
        records: ['$location', 'recordResource', function($location, recordResource){
          //get app stats only for admin-user, otherwise redirect to /account
              return recordResource.getAllRecords($location.search());
        }]
      },
      reloadOnSearch: false
    });
}]);

angular.module('account.play').controller('PlayCtrl', [ '$scope', '$window', '$location', '$log', 'security', 'utility', 'recordResource', 'accountDetails', 'SOCIAL', 'records',
  function($scope, $window, $location, $log, security, utility, restResource, account, SOCIAL, data){
    console.log($location);
    var deserializeData = function(data){
      $scope.items = data.items;
      $scope.pages = data.pages;
      $scope.filters = data.filters;
      $scope.records = data.data;
    };

    var fetchRecords = function(){
      restResource.getAllRecords($scope.filters).then(function(data){
        deserializeData(data);

        //update url in browser addr bar
        $location.search($scope.filters);
      }, function(e){
        $log.error(e);
      });
    };

    // $scope methods
    $scope.canSave = utility.canSave;
    $scope.filtersUpdated = function(){
      //reset pagination after filter(s) is updated
      $scope.filters.page = undefined;
      fetchRecords();
    };
    $scope.prev = function(){
      $scope.filters.page = $scope.pages.prev;
      fetchRecords();
    };
    $scope.next = function(){
      $scope.filters.page = $scope.pages.next;
      fetchRecords();
    };
    //console.log(sess);
    // $scope vars
    //select elements and their associating options
    $scope.sorts = [
      {label: "votes \u25B2", value: "votes"},
      {label: "votes \u25BC", value: "-votes"}
    ];
    $scope.limits = [
      {label: "10 items", value: 10},
      {label: "20 items", value: 20},
      {label: "50 items", value: 50},
      {label: "100 items", value: 100}
    ];

    //initialize $scope variables
    deserializeData(data);

    $scope.redirect = function(record) {
      $location.url("account/comments?songName="+record.name);
    };

    $scope.upvote = function(record){
      var voted = false;
      for(var voter in record.voters){
        if(record.voters[voter] === account.user.username || record.user === account.user.username){
          voted = true;
        }
      }
      if(voted === false){
        restResource.upvote(record).then(function(){
          $window.location.reload("account/play");
        });
      }

    }; 
  }
]);
