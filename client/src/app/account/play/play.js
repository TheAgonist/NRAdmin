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
        }]
      }
    });
}]);

angular.module('account.play').controller('PlayCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'recordResource', 'accountResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, accountResource, SOCIAL){
    restResource.getRecordDetails().then(function(data){
        var records = data.account;
        var rank = 1;
        for(var record in records){
          displayRecord(records[record], rank);
          rank++;
        }
      });
    function displayRecord(record, rank){
      var first = document.createElement("TD");
      first.innerHTML = rank;
      var second = document.createElement("TD");
      second.innerHTML = record.name;
      var third = document.createElement("TD");
      accountResource.getAccountDetails(record.user).then(function(data){
        third.innerHTML = data.user.username;
      });
      var fourth = document.createElement("TD");
      fourth.innerHTML = record.votes;
      var fifth = document.createElement("TD");
      var upvote = createUpvoteButton(record);
      fifth.appendChild(upvote);
      var sixth = document.createElement("TD");
      var play = createPlayButton(record);
      sixth.appendChild(play);
      var seventh = document.createElement("TD");
      var sheetButton = createSheetButton(record);
      seventh.appendChild(sheetButton);
      var delButton = createDeleteButton(record);
      var eighth = document.createElement("TD");
      eighth.appendChild(delButton);
      var row = document.createElement("TR");
      row.id = "row";
      row.appendChild(first);
      row.appendChild(second);
      row.appendChild(third);
      row.appendChild(fourth);
      row.appendChild(fifth);
      row.appendChild(sixth);
      row.appendChild(seventh);
      /*if(curUser.role == "mod"){
          row.appendChild(eighth);
      }*/
      var table = document.getElementById("listRecords");
      table.appendChild(row);
    }

    function createDeleteButton(record){
      var del = document.createElement("BUTTON");
      del.id = "deleteButton";
      /*del.onclick = function(){
          PlayService.deleteRecord(record);
      }*/
      del.innerHTML = "delete";
      return del;
    }

    function createSheetButton(record){
      var sheet = document.createElement("BUTTON");
      sheet.id = "sheetButton";
      sheet.onclick = function() {
          location.href ='./sheetMusic?bufferName='+record.name;
      };
      sheet.innerHTML = "Show sheet music";
      return sheet;
    }

    function createUpvoteButton(record){
      var upvote = document.createElement("BUTTON");
      upvote.id = "upvoteButton";
      upvote.onclick = function() {
          upvoteFunc(record);
           };
      upvote.innerHTML = "UPVOTE";
      return upvote;
    }

    function createPlayButton(record){
      var play = document.createElement("BUTTON");
      play.id = "playButton";
      play.onclick = function() {
                  location.href ='./comments?songName='+record.name;
      };
      play.innerHTML = "PLAY";
      return play;
    }

    function upvoteFunc(record){
      restResource.upvote(record);
    } 
  }
]);
