var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var World = require('./W3PoC/world.js')
var debug = require('debug')('app');


var app = express();

var world = 0;
var toBeProcessed = [];
var doneProcessing = [];

// This variable controls the size of the normal batch sent to client for processing.
var batchSize = 10;

// This variable is a pointer of sort that keeps track of how many animals
// we've already sent for processing, and where the next batch shall begin.
var sentForProcessing = 0;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


//app.use(logger('dev'));


//app.use('/', index);
//app.use('/users', users);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        return res.status(200).json({});
    };
  next();
});


// This is handler for accessing the main page. It returns index page and
// creates a new world if needed. If a world is in existance, it will not create
// a new world.
app.get('/', function(req, res){
    debug("Get slash");

    if (world === 0) {
        world = new World();
    }
  res.sendFile(__dirname + '/index.html');
  debug("returned index.html");
});


// Handler for request for client to start a simultion.
app.get('/runSimulation', function(req, res){
    debug("Get /runSimulation");

    if (world === 0) {
        world = new World();
    }

    res.sendFile(__dirname + '/runSimulation.html');
    debug("returned runSimulation.html");

});


//This is a handler for client requests for batch to process.
//If there are animals left to process, it returns them to the client
//for processing.
app.get('/processBatch', function(req, res){
  debug("get /processBatch");

  //TODO: Check if host registered and regiter it if not.


  if (sentForProcessing < world.animals.length) {
      batch = world.animals.slice(sentForProcessing, sentForProcessing + batchSize);
      sentForProcessing += batchSize;
      //console.log("Sending " + batch.length + " animals.");
      //console.log("Locs: " + world.locations);
      var response = {"locations" : world.locations, "batch" : batch};
      res.send(response);
      //console.debug("returned response: " + response);
  } else {
    res.send('"status" : 0');
    debug("No animals to process. Sent back status 0 (wait).");
  }
});

// This is handler for clients returning animal actions.
// These actions need to be applied to the world.
app.post('/submitBatchProcessingResult', function(req, res) {
    debug("post /submitBatchProcessingResult");

    var actions = req.body;

    doneProcessing.push(...actions);
    //console.log("Received actions: " + actions);
    //console.log("Currently processed " + doneProcessing.length + " out of " + world.animals.length + ".");


    if (doneProcessing.length >= world.animals.length) {
        //console.log("scheduling world update execution.");
        // TODO: This will surely need to be fixed at some point.
        //setTimeout(executeUpdate(), 100);
        executeUpdate();
    }

    //console.log("Ending the request.");
    res.end();
    //debug("Sending back the end to response.");
});





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// -- Helper funtions


// Apply the actions from the animals to the world. Update animal location, energy level.
// Create the new animals, remove the dead ones.

function executeUpdate() {

    var energyLoss = 2;
    var energyContent = 5;

    console.log("EXECUTING UPDATE.");
    doneProcessing = doneProcessing.flat();
    console.log("flattened.");
    doneProcessing = doneProcessing.filter(function(el) {
        //console.log("EL: " + el);
        return (el != null && el.length > 0);
    });

    console.log("filtered.");
    console.log("There are " + doneProcessing.length + " actions contributed.");
    doneProcessing.forEach(action => {
        world.worldActions[action[0]](action[1]);
    });

    world.animals.forEach(animal => {
        // Remove the cost of the energy for animals that are alive and not plants
        // Alive: energy > 0. Not plant: Type > first quarter.
        if (animal.energy > 0 && animal.genome.type > 1) {
            animal.energy -= energyLoss * animal.genome.size;
        }
        if (animal.energy <= 0) {
            // Killing the energy by removing its senses(tracts).
            animal.genome.tracts = [];
        }
        if (animal.energy < -(energyContent * animal.genome.size)) {
            //Now the animal has been fully eaten, remove it from the world.
            console.log("Removing a dead animal from the world.");
            world.animals.remove(animal);
        }
    })


    // House keeping with the variables

    toBeProcessed = [];
    doneProcessing = [];
    sentForProcessing = 0;
    world.cycle += 1;
    console.log("Time for a new cycle " + world.cycle + ", now with " + world.animals.length + " animals.");
    //console.log("Animal 1 status: " + world.animals[0].energy);
}

module.exports = app;
