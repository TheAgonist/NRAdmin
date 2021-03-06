'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    csrf = require('csurf');

//create express app
var app = express();

//keep reference to config
app.config = config;

//setup the web server
app.server = http.createServer(app);

//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  //and... we have a data store
});

//config data models
require('./models')(app, mongoose);

//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'client/dist')));

app.use(require('serve-static')(path.join(__dirname, 'public/songs')));




app.use(require('method-override')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());

var busboy = require('connect-busboy'),
    fs = require('fs-extra');
var record = require('./service/record');
var record = require('./service/account');
app.use(busboy());
var shortid = require('shortid');
app.route('/upload').post(function(req, res, next){
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log("Uploading: " + filename);
    var fileName = filename.split(".");
    //Path where image will be uploaded
    var saveName = shortid.generate() + ".mid";
    fstream = fs.createWriteStream(__dirname + '/public/songs/' + saveName);
    file.pipe(fstream);
    fstream.on('close', function () {
      var mp3Name = saveName.split(".");
      require('child_process').exec("timidity "+__dirname + '/public/songs/'+saveName+" -Ow -o - | ffmpeg -i - -acodec libmp3lame -ab 256k "+__dirname + '/public/songs/'+mp3Name[0]+".mp3");
      req.app.db.models.User.findById(req.session.passport.user).then(function(result){
        var set = {
            name: saveName,
            showName: fileName[0],
            user: result.username,
            show: false,
            votes: 0,
            delete: false,
        };
        console.log(set);
        req.app.db.models.Record.create(set);
        res.redirect('http://localhost:3000/account/upload');           //where to go next
      });
    });
  });
});

app.use(csrf({ cookie: { signed: true } }));
helmet(app);
  
//response locals
app.use(function(req, res, next) {
  res.cookie('_csrfToken', req.csrfToken());
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

//setup passport
require('./passport')(app, passport);

//setup routes
require('./routes')(app, passport);

//custom (friendly) error handler
app.use(require('./service/http').http500);

//setup utilities
app.utility = {};
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');

//listen up
app.server.listen(app.config.port, function(){
  //and... we're live
});
