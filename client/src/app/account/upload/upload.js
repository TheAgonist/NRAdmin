angular.module('account.upload', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.accountResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.upload').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/upload',{
      templateUrl: 'account/upload/upload.tpl.html',
      controller: 'RecordCtrl',
      title: 'Upload',
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
angular.module('account.upload').controller('RecordCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'recordResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, SOCIAL){
    restResource.getUserRecordDetails().then(function(data){
      var records = data.account;
      for(var record in records){
        if(records[record].deleted === false){
            displayRecord(records[record]);
        }
      }
    });
    function displayRecord(record){
      var first = document.createElement("TD");
      first.innerHTML = record.name;
      var second = document.createElement("TD");
      second.innerHTML = record.votes;
      var third = document.createElement("TD");
      var play = createPlayButton(record);
      third.appendChild(play);
      var fourth = document.createElement("TD");
      var sheetButton = createSheetButton(record);
      fourth.appendChild(sheetButton);
      var delButton = createDeleteButton(record);
      var fifth = document.createElement("TD");
      fifth.appendChild(delButton);
      var row = document.createElement("TR");
      row.id = "row";
      row.appendChild(first);
      row.appendChild(second);
      row.appendChild(third);
      row.appendChild(fourth);
      row.appendChild(fifth);
      var table = document.getElementById("listRecords");
      table.appendChild(row);
    }

    function createDeleteButton(record){
      var del = document.createElement("BUTTON");
      del.id = "deleteButton";
      del.onclick = function(){
        restResource.deleteRecord(record).then(function(){
          console.log("redirect");
        });
      };
      del.innerHTML = "delete";
      return del;
    }

    function createSheetButton(record){
      var sheet = document.createElement("BUTTON");
      sheet.id = "sheetButton";
      /*sheet.onclick = function() {
          location.href ='./sheetMusic?bufferName='+record.name;
      };*/
      sheet.innerHTML = "Show sheet music";
      return sheet;
    }

    function createPlayButton(record){
      var play = document.createElement("BUTTON");
      play.id = "playButton";
      play.onclick = function(){
        createAudioTag(record);
      };
      play.innerHTML = "PLAY";
      return play;
    }

    function createAudioTag(record){
      var audio = document.createElement("AUDIO");
      audio.controls = true;
      var source = document.createElement("SOURCE");
      source.src = "http://localhost:3000/img/Night.mp3";
      source.type = "audio/mpeg";
      audio.appendChild(source);
      var row = document.getElementById("row");
      row.appendChild(audio);
    } 
  }
]);
