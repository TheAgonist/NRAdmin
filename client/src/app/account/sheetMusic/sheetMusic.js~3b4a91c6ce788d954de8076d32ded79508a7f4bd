angular.module('account.sheetMusic', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.recordResource', 'services.utility','ui.bootstrap', 'directives.serverError']);


angular.module('account.play').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/sheetMusic', {
      templateUrl: 'account/sheetMusic/sheetMusic.tpl.html',
      controller: 'SheetMisicCtrl',
      title: 'SheetMusic',
      // resolve: {
      //   accountDetails: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
      //     //get account details only for verified-user, otherwise redirect to /account/verification
      //     var redirectUrl;
      //     var promise = securityAuthorization.requireVerifiedUser()
      //       .then(accountResource.getAccountDetails, function(reason){
      //         //rejected either user is unverified or un-authenticated
      //         redirectUrl = reason === 'unverified-client'? '/account/verification': '/login';
      //         return $q.reject();
      //       })
      //       .catch(function(){
      //         redirectUrl = redirectUrl || '/account';
      //         $location.path(redirectUrl);
      //         return $q.reject();
      //       });
      //     return promise;
      //   }]
      // }
    });
}]);



angular.module('account.sheetMusic').controller('SheetMusicCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'recordResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, SOCIAL){
     initController();
        
        function initController(){
          console.log('hi');
          var notes = new Array();

          var map = {
            "c": "1", 
            "c#": "2", 
            "d": "3", 
            "d#": "4", 
            "e": "5", 
            "f": "6", 
            "f#": "7", 
            "g": "8", 
            "g#": "9", 
            "a": "10", 
            "a#": "11",
            "b": "12"};







            var canvas = $("canvas")[0];
            //canvas.height+=100000;  
            var renderer = new Vex.Flow.Renderer(canvas,
                Vex.Flow.Renderer.Backends.CANVAS);
            var vpSize = viewport();
            var staveWidth = vpSize.width/2;
            var notesPerStave = Math.floor(staveWidth/50);
          var ctx = renderer.getContext();
          console.log(vpSize);
          console.log(staveWidth + "  " + notesPerStave);
          var stave = new Vex.Flow.Stave(0, 0, staveWidth);
          stave.addClef("treble").setContext(ctx).draw();
          

          // Create the notes
          

          // Create a voice in 4/4
          // var voice = new Vex.Flow.Voice({
          //   num_beats: 4,
          //   beat_value: 4,


          //   resolution: Vex.Flow.RESOLUTION
          // });

          // Add notes to voice
       
          function viewport()
          {
            var e = window
              , a = 'inner';
            if ( !( 'innerWidth' in window ) )
            {
              a = 'client';
              e = document.documentElement || document.body;
            }
            return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
          }


          function create_4_4_voice() {
            return new Vex.Flow.Voice({
              num_beats: 4,
              beat_value: 4,
              resolution: Vex.Flow.RESOLUTION
            });
          }
// var notes = [];
          var notes = sheetMusicService.getBuffer('f.mid').then(function(response){
            canvas.height = Math.ceil(notes.length/notesPerStave)*300;
            console.log(response);
            var noteList = [];
            var k =0; 
            var roundPitch = 0;
            var highestNote=0,lowestNote=1000, nextDelta =0, globalDelta=0;
            response.data.forEach(function (element, index, array){
              //console.log(element);
              // noteList.push(new Vex.Flow.StaveNote({ keys: ["c##/4"], duration: "q" }))
              var not = new Vex.Flow.StaveNote({ keys: [element[1]], duration: element[0] });
             console.log(element[1].split('#').length);
              var note = element[1].split('/');
              var octave = map[note[0]]*(note[1]-4);
              console.log(note + "  " + octave+"   "+lowestNote+"  "+ highestNote);              
              if(octave < lowestNote){
                lowestNote=octave;
              }
              if(octave > highestNote){
                highestNote = octave;
              }

              if(element[1].split('#').length ==2){
                not. addAccidental(0, new Vex.Flow.Accidental("#"));

              }
               noteList.push(not);  
              k++;
              if(k%notesPerStave == 0){
                //console.log(lowestNote + "   "+ highestNote);
                // canvas.height=(k/notesPerStave)*100 + globalDelta + 200;
                globalDelta+= 10*Math.abs(highestNote) + 10*Math.abs(nextDelta);
                highestNote = 0;
                nextDelta = lowestNote;
                lowestNote =1000;

                Vex.Flow.Formatter.FormatAndDraw(ctx, stave, noteList);
                noteList = [];
                stave = new Vex.Flow.Stave(0, (k/notesPerStave)*100 + globalDelta, staveWidth);
                stave.addClef("treble").setContext(ctx).draw();
               
              } 
              //console.log(new Vex.Flow.StaveNote({ keys: [element[1]], duration: element[0] }));
            }); 
            if(noteList != null)
              Vex.Flow.Formatter.FormatAndDraw(ctx, stave, noteList);
            //console.log(noteList);
            return noteList;
          });
          console.log(notes);
          //notes.push(new Vex.Flow.StaveNote({ keys: ["a/9"], duration: "q" }));  
          //notes.push((new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q" })));
          //console.log(voice);
          // voice.addTickables(notes);
          // console.log(voice);
          //Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
          // Format and justify the notes to 500 pixels
          // var formatter = new Vex.Flow.Formatter().
          //   joinVoices([voice]).format([voice], 500);

          // Render voice
          //voice.draw(ctx, stave);
                
        }
  }
]);