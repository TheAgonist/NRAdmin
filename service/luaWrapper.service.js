
var luaWrapper = {

    var config = require('config.json');
    var express = require('express');
    var busboy = require('connect-busboy');
    var fs = require('fs-extra');
    var MIDIFile = require('midifile');
    var MIDIEvents = require('midievents');
    var MIDIFileHeader = require('midifile/src/MIDIFileHeader.js');
    var toArrayBuffer = require('to-arraybuffer'); 
    var router = express.Router();
     var spawn = require('child_process');
    //var playService = require('services/play.service');
    //var sheetMusicService = require ('services/sheetMusic.service');
    // routes
    router.get('/:bufferName',getBuffer);
    //router.get('/:bufferName', getBuffer);
    //router.put('/:_id', updateRecord);

    module.exports = router;

     getBuffer: function(req, res){
        //console.log("\n"+window.location.pathname+"\n");
        spawn.exec("th ./././lstm2/encode.lua -filename public/img/"+req.params.bufferName /*"./././public/img/bufferName "*/, function(error,stdout,stderr){
            if (error) {
                        console.log(error.stack);
                        console.log('Error code: '+error.code);
                        console.log('Signal received: '+error.signal);
                     }
             console.log(stdout);
            res.send(stdout);
        });
    }





    //function getBuffer(req, res) {
    //     //var fstream;
    //     var readStream = fs.readFile("public/img/"+req.params.bufferName,function(err,data){
    //        //console.log(toArrayBuffer(data));
    //        readMidi(toArrayBuffer(data));
    //        //res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
    //         res.send(data);
    //     });
    //     /*var readStream = fs.createReadStream("public/img/"+req.params.bufferName);
    //     //console.log(readStream);
    //     // This will wait until; we know the readable stream is actually valid before piping
    //     readStream.on('open', function () {
    //         readStream.pipe(res);
    //     });
    //     readStream.on('end', function () {
    //         readStream.end(res);
    //     });*/
    // }
    // function toArrayBuffer(buffer) {
    //     var ab = new ArrayBuffer(buffer.length);
    //     var view = new Uint16Array(ab);
    //     for (var i = 0; i < buffer.length; ++i) {
    //         view[i] = buffer[i];
    //     }
    //     return view;
    // }
    // function readMidi(arrayBuffer){
                
    //             //console.log(arrayBuffer);
    //             // Creating the MIDIFile instance
    //             var midiFile = new MIDIFile(arrayBuffer);

    //             // Reading headers
    //             midiFile.header.getFormat(); // 0, 1 or 2
    //             midiFile.header.getTracksCount(); // n
    //             // Time division
    //             //console.log(midiFile.header);
    //             if(midiFile.header.getTimeDivision() === MIDIFileHeader.TICKS_PER_BEAT) {
    //                 midiFile.header.getTicksPerBeat();
    //             } else {
    //                 midiFile.header.getSMPTEFrames();
    //                 midiFile.header.getTicksPerFrame();
    //             }

    //             // MIDI events retriever
    //             var events = midiFile.getMidiEvents();
    //             events[0].subtype; // type of [MIDI event](https://github.com/nfroidure/MIDIFile/blob/master/src/MIDIFile.js#L34)
    //             events[0].playTime; // time in ms at wich the event must be played
    //             events[0].param1; // first parameter
    //             events[0].param2; // second one

    //             // Reading whole track events and filtering them yourself
    //             var trackEventsChunk = midiFile.getTrackEvents(0);
    //             var events = MIDIEvents.createParser(trackEventsChunk);
    //             co
    //             var event;
    //             while(event=events.next()) {
    //                 // Printing meta events containing text only
    //                 if(event.type === MIDIFile.EVENT_META && event.text) {
    //                     console.log('Text meta: '+event.text);
    //                 }
    //             }

    //           }
}