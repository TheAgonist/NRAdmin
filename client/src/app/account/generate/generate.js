angular.module('account.generate', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.linuxWrapperResource', 'services.utility','ui.bootstrap', 'directives.serverError']);


angular.module('account.generate').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/generate', {
      templateUrl: 'account/generate/generate.tpl.html',
      controller: 'GenerateCtrl',
      title: 'Generate',
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
              return recordResource.getAllGeneratedRecordsForUser($location.search());
        }]
      },
      reloadOnSearch: false
    });
}]);



angular.module('account.generate').controller('GenerateCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'linuxWrapperResource', 'recordResource', 'SOCIAL', 'records',
  function($scope, $location, $log, security, utility, restResource, recordResource, SOCIAL, data){

    var submitForm = function(){
      console.log("ready");
      restResource.generate().then(function(data){
        console.log("generated");
      });
    };

    $scope.submit = function(){
      submitForm();
    };


    var deserializeData = function(data){
      $scope.items = data.items;
      $scope.pages = data.pages;
      $scope.filters = data.filters;
      $scope.records = data.data;
    };

    var fetchRecords = function(){
      recordResource.getAllGeneratedRecordsForUser($scope.filters).then(function(data){
        deserializeData(data);
        $location.search($scope.filters);
      }, function(e){
        $log.error(e);
      });
    };

    // $scope methods
    $scope.canSave = utility.canSave;
    
    $scope.filtersUpdated = function(){
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
  }
]);