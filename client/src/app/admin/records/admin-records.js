angular.module('admin.records.index', ['ngRoute', 'security.authorization', 'services.utility', 'services.recordResource']);
angular.module('admin.records.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/records', {
      templateUrl: 'admin/records/admin-records.tpl.html',
      controller: 'RecordsIndexCtrl',
      title: 'Manage Records',
      resolve: {
        users: ['$q', '$location', '$log', 'securityAuthorization', 'recordResource', function($q, $location, $log, securityAuthorization, recordResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              //handles url with query(search) parameter
              return recordResource.getAllRecords($location.search());
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
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

angular.module('admin.records.index').controller('RecordsIndexCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'recordResource', 'users',
  function($scope, $route, $location, $log, utility, recordResource, data){
    console.log(data);
    var deserializeData = function(data){
      $scope.items = data.items;
      $scope.pages = data.pages;
      $scope.filters = data.filters;
      $scope.records = data.data;
    };

    var fetchRecords = function(){
      console.log($scope.filters);
      recordResource.getAllRecords($scope.filters).then(function(data){
        deserializeData(data);

        // update url in browser addr bar
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

    $scope.remove = function(record){
      recordResource.deleteRecord(record).then(function(res){
        console.log(res);
      });
    };

    // $scope vars
    //select elements and their associating options
    $scope.sorts = [
      {label: "id \u25B2", value: "_id"},
      {label: "id \u25BC", value: "-_id"},
      {label: "username \u25B2", value: "username"},
      {label: "username \u25BC", value: "-username"},
      {label: "name \u25B2", value: "name"},
      {label: "name \u25BC", value: "-name"}
    ];
    $scope.limits = [
      {label: "10 items", value: 10},
      {label: "20 items", value: 20},
      {label: "50 items", value: 50},
      {label: "100 items", value: 100}
    ];

    //initialize $scope variables
    deserializeData(data);
  }
]);