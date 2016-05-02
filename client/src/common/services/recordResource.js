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
  resource.getRecordDetails = function(){
    console.log("dddcccc");
    return $http.get(baseUrl + '/record/all').then(processResponse, processError);
  };
  resource.upvote = function(record){
    return $http.put(baseUrl + '/record/upvote', record).then(processResponse, processError);
  };
  resource.deleteRecord = function(record){
    return $http.put(baseUrl + '/record/delete', record).then(processResponse, processError);
  };
  resource.getUserRecordDetails = function(){
    return $http.get(baseUrl + '/record/user').then(processResponse, processError);
  };
  return resource;
}]);