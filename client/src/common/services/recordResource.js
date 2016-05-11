angular.module('services.recordResource', ['security.service']).factory('recordResource', ['$http', '$q', '$log', 'security', function ($http, $q, $log, security) {
  // local variable
  var baseUrl = '/api';
  var processResponse = function(res){
    return res.data;
  };
  var processError = function(e){
    var msg = [];
    if(e.status)         { msg.push(e.status); }
    if(e.statusText)     { msg.push(e.statusText); }
    if(msg.length === 0) { msg.push('Unknown Server Error'); }
    return $q.reject(msg.join(' '));
  };
  // public api
  var resource = {};
  resource.getAllRecords = function(filters){
    return $http.get(baseUrl + '/record/records', { params: filters }).then(processResponse, processError);
  };
  resource.upvote = function(record){
    return $http.put(baseUrl + '/record/upvote', record).then(processResponse, processError);
  };
  resource.showRecord = function(record){
    console.log(record);
    return $http.put(baseUrl + '/record/show', record).then(processResponse, processError);
  };
  resource.deleteRecord = function(record){
    console.log(record);
    return $http.put(baseUrl + '/record/delete', record).then(processResponse, processError);
  };
  resource.getAllUserRecords = function(filters){
    return $http.get(baseUrl + '/record/user', { params: filters }).then(processResponse, processError);
  };
  resource.getAllGeneratedRecordsForUser = function(filters){
    return $http.get(baseUrl + '/record/generated', { params: filters }).then(processResponse, processError);
  };
  return resource;
}]);