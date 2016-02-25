// Setup Environment 
var express = require('express'),
  fs = require('fs'),
  morgan = require('morgan'),
  bodyParser = require('body-parser');
var config = require('./config/config.js');

var hskey = fs.readFileSync('hacksparrow-key.pem');
var hscert = fs.readFileSync('hacksparrow-cert.pem');

var options = {
    key: hskey,
    cert: hscert
};

var passport = require("./middleware/passport.js");
var app = express(options);
var AuthController = require("./controllers/AuthController.js");
var myMongo = require("./db/mymongo.js");
var webSocket = require("./ws/ws.js");

//entry point
myMongo.initializeMongoose(initialize);

function initialize(){
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());

  app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
  });

  app.all('/api/v1/*', AuthController.validateRequest);

  app.use('/', require('./routes'));

  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Run the populate file... Uncomment Lines and restart server
  // var populate = require("./test/populate.js");
  // populate();

  var server = app.listen(config.port, config.ipaddress, function() {
          console.log('%s: Node server started on %s:%d ...',
                          Date(Date.now() ), config.ipaddress, config.port);
  });

  webSocket.initializeWebSocket(server);
}