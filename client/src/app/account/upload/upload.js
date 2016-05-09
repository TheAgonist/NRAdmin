angular.module('account.upload', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.accountResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.upload').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/upload',{
      templateUrl: 'account/upload/upload.tpl.html',
      controller: 'RecordCtrl',
      title: 'Upload',
      resolve: {
        records: ['$q', '$location', '$log', 'securityAuthorization', 'recordResource', function($q, $location, $log, securityAuthorization, recordResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(function(){
              //handles url with query(search) parameter
              return recordResource.getAllUserRecords($location.search());
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unverified-client'? '/account/verification': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.search({});
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }]
      },
      reloadOnSearch: false
    });
}]);
angular.module('account.upload').controller('RecordCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'recordResource', 'SOCIAL', 'records',
  function($scope, $location, $log, security, utility, restResource, SOCIAL, data){
    var deserializeData = function(data){
      $scope.items = data.items;
      $scope.pages = data.pages;
      $scope.filters = data.filters;
      console.log($scope.filters);
      $scope.records = data.data;
    };

    var fetchRecords = function(){
      restResource.getAllUserRecords($scope.filters).then(function(data){
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

    $scope.alerts = {
      detail: [], identity: [], pass: []
    };
    $scope.show = function(record){
      restResource.showRecord(record);
    };

    $scope.remove = function  (record) {
      restResource.deleteRecord(record);
    }

    $scope.closeAlert = function(key, ind){
      $scope.alerts[key].splice(ind, 1);
    }; 

  }
]);
