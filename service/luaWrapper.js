'use strict'

var shortid = require('shortid');
var luaWrapper = {
    //var playService = require('services/play.service');
    //var sheetMusicService = require ('services/sheetMusic.service');
    // routes
    // router.get('/:bufferName',getBuffer);
    //router.get('/:bufferName', getBuffer);
    //router.put('/:_id', updateRecord);

     getBuffer: function(req, res){
        require('child_process').exec("th ./././lstm2/encode.lua -filename public/songs/"+req.body.bufferName /*"./././public/img/bufferName "*/, function(error,stdout,stderr){
            if (error) {
                        console.log(error.stack);
                        console.log('Error code: '+error.code);
                        console.log('Signal received: '+error.signal);
                     }
            //console.log(stdout);
            res.send(stdout);
        });
    },
    generateNew: function(req, res){
        var filename = shortid.generate()+".mid";
        require('child_process').exec("th ./././lstm2/sample.lua ./././lstm2/cv/beethoven.t7 -filename public/songs/"+filename, function(error,stdout,stderr){
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
        }
                //console.log('stdout: ' + stdout);
                //console.log('stderr: ' + stderr);
        var set = {
            name: filename,
            showName: "generated",
            user: req.session.passport.user,
            generator: req.user.name,
            show: true,
            votes: 0,
            delete: false
        };
        req.app.db.models.Record.create(set);
        //res.send(filename);
        res.redirect('http://localhost:3000/account/sheetMusic');
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


    module.exports = luaWrapper;
