angular.module('services.linuxWrapperResource', ['security.service']).factory('linuxWrapperResource', ['$http', '$q', '$log', 'security', function ($http, $q, $log, security) {

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


  var resource = {};

  resource.getBuffer = function(buffer){
  	return $http.get(baseUrl+'/sheetMusic/bufferName',buffer).then(processResponse,processError);
  };

  return resource;
}]);