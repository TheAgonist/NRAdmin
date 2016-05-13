angular.module('account.sheetMusic', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.linuxWrapperResource', 'services.utility','ui.bootstrap', 'directives.serverError']);


angular.module('account.sheetMusic').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/sheetMusic', {
      templateUrl: 'account/sheetMusic/sheetMusic.tpl.html',
      controller: 'SheetMusicCtrl',
      title: 'SheetMusic',
    });
}]);



angular.module('account.sheetMusic').controller('SheetMusicCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'linuxWrapperResource', 'SOCIAL',
  function($scope, $location, $log, security, utility, restResource, SOCIAL){
     initController();
          
        function initController(){
          console.log('hi');
          var notes = [];

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

            // console.log(Vex);


            // canvas.height+=100000;  
          

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
            var e = window;
            var a = 'inner';
            if ( !( 'innerWidth' in window ) )
            {
              a = 'client';
              e = document.documentElement || document.body;
            }
            return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
          }
          var vpSize = viewport();

          // function create_4_4_voice() {
          //   return new Vex.Flow.Voice({
          //     num_beats: 4,
          //     beat_value: 4,
          //     resolution: Vex.Flow.RESOLUTION
          //   });
          // }
    var notes = new Array();
    var send = {
      bufferName: $location.$$search.bufferName.split(" ")[1]
    };
    // console.log(send);
    restResource.getBuffer(send).then(function(response){
          var canvas = $("canvas")[0];            
            //console.log(canvas);
            var renderer = new Vex.Flow.Renderer(canvas,
                  Vex.Flow.Renderer.Backends.CANVAS);
            var ctx = renderer.getContext();
            ctx.setFont("5px sans-serif");
            var staveWidth = vpSize.width/2;
            var notesPerStave = Math.floor(staveWidth/50);
            ctx.vexFlowCanvasContext.canvas.width = vpSize.width/2;
            ctx.vexFlowCanvasContext.canvas.height = vpSize.height;//Math.ceil(response.length/notesPerStave)*300;
            stave = new Vex.Flow.Stave(0, 300,1000);
                console.log(stave.addClef("treble").setContext(ctx).draw());
                //console.log(noteList);
                Vex.Flow.Formatter.FormatAndDraw(ctx, stave, []);
            
            //ctx.background = "#000"
            // console.log(ctx);
            // console.log(staveWidth + "  " + notesPerStave);

            
            console.log(response.length);
            var noteList = [];
            var k =0; 
            var roundPitch = 0;
            var highestNote=0,lowestNote=1000, nextDelta =0, globalDelta=0;
            response.forEach(function (element, index, array){
              //console.log(element);
              // noteList.push(new Vex.Flow.StaveNote({ keys: ["c##/4"], duration: "q" }))
              var not = new Vex.Flow.StaveNote({ keys: [element[1]], duration: element[0] });
              // console.log(not);
              var note = element[1].split('/');
              var octave = map[note[0]]*(note[1]-4);
              //console.log(note + "  " + octave+"   "+lowestNote+"  "+ highestNote);              
              if(octave < lowestNote){
                lowestNote=octave;
              }
              if(octave > highestNote){
                highestNote = octave;
              }

              if(element[1].split('#').length === 2){
                not. addAccidental(0, new Vex.Flow.Accidental("#"));
              }
               noteList.push(not);  
               
                
              
              //console.log(new Vex.Flow.StaveNote({ keys: [element[1]], duration: element[0] }));
            }); 
            if(noteList !== null){
              
              Vex.Flow.Formatter.FormatAndDraw(ctx, stave, noteList);

            }
            //console.log(noteList);

           //  console.log(noteList);
           //  noteList.push(new Vex.Flow.StaveNote({ keys: ["a/9"], duration: "q" }));  
           //  noteList.push((new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q" })));
           //  console.log(voice);
           //  voice.addTickables(noteList);
           //  console.log(voice);
           //  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, noteList);
           // // Format and justify the notes to 500 pixels
           //  var formatter = new Vex.Flow.Formatter().
           //    joinVoices([voice]).format([voice], 500);

            //Render voice

            $scope.next = function(){
              //console.log($scope.pages);
              //$scope.filters.page = $scope.pages;
              fetchPage();
            }
            $scope.prev = function(){
              console.log("PREV!");
              //$scope.filters.page = $scope.pages.next;
              fetchPage();
            }
            function fetchPage(){
              console.log(ctx);
              // if(k%notesPerStave === 0){
              //   console.log(notesPerStave);
              //   //canvas.height=(k/notesPerStave)*100 + globalDelta + 200;
              //   globalDelta+= 10*Math.abs(highestNote) + 10*Math.abs(nextDelta);
              //   highestNote = 0;
              //   nextDelta = lowestNote;
              //   lowestNote =1000;
              //   stave = new Vex.Flow.Stave(100, (k/notesPerStave)*100 + globalDelta, staveWidth);
              //   stave.addClef("treble").setContext(ctx).draw();
              //   // console.log(noteList);
              //   Vex.Flow.Formatter.FormatAndDraw(ctx, stave, noteList);
              //   console.log(ctx);
              //   noteList = [];
                // }
            }
        });
      }


      /**
 * VexFlow 1.2.45 built on 2016-03-21.
 * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>
 *
 * http://www.vexflow.com  http://github.com/0xfe/vexflow
 */
//# sourceMappingURL=vexflow-min.js.map
  }
]);