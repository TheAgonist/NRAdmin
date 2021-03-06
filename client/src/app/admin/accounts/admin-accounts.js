angular.module('admin.accounts.index', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource']);
angular.module('admin.accounts.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/accounts', {
      templateUrl: 'admin/accounts/admin-accounts.tpl.html',
      controller: 'AccountsIndexCtrl',
      title: 'Manage Accounts',
      resolve: {
        accounts: ['$q', '$location', '$log', 'securityAuthorization', 'adminResource', function($q, $location, $log, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              //handles url with query(search) parameter
              return adminResource.findAccounts($location.search());
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
angular.module('admin.accounts.index').controller('AccountsIndexCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'accounts',
  function($scope, $route, $location, $log, utility, adminResource, data){
    //// local var
    var deserializeData = function(data){
      var results = data.results;
      $scope.statuses = data.statuses;
      $scope.items = results.items;
      $scope.pages = results.pages;
      $scope.filters = results.filters;
      $scope.accounts = results.data;
    };

    var fetchAccounts = function(){
      adminResource.findAccounts($scope.filters).then(function(data){
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
      fetchAccounts();
    };
    $scope.prev = function(){
      $scope.filters.page = $scope.pages.prev;
      fetchAccounts();
    };
    $scope.next = function(){
      $scope.filters.page = $scope.pages.next;
      fetchAccounts();
    };
    $scope.remove = function(id){
      adminResource.deleteAccount(id).then(function(res){
        console.log(res);
      });
    };

    // $scope vars
    //select elements and their associating options
    $scope.statuses = [];
    $scope.sorts = [
      {label: "id \u25B2", value: "_id"},
      {label: "id \u25BC", value: "-_id"},
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