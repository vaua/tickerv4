var express = require('express');
var responseTime = require('response-time');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');

var index = require('./routes/index');
var users = require('./routes/users');
const { start } = require('repl');
var debug = require('debug')('app');
require('log-timestamp');

var app = express();
app.use(responseTime());
app.use(compression());


var world = 0;
var batchNumber = 0;
var toBeProcessed = [];
var doneProcessing = [];
var receivedBatches = 0;
var startOfTick = 0;

// This variable controls the size of the normal batch sent to client for processing.
var batchSize = 500;

// This variable is a pointer of sort that keeps track of how many animals
// we've already sent for processing, and where the next batch shall begin.
var sentForProcessing = 0;



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
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

    res.sendFile(__dirname + '/runSimulation.html');
    debug("returned runSimulation.html");

});


//This is a handler for client requests for batch to process.
//If there are animals left to process, it returns them to the client
//for processing.
app.get('/processBatch', function(req, res){
  debug("get /processBatch");

  //TODO: Check if host registered and regiter it if not.

  // Check if first batch in tick
  if (startOfTick == 0) {
      startOfTick = Date.now();
  }

  if (sentForProcessing < world.locations.length) {
      batch = world.locations.slice(sentForProcessing, sentForProcessing + batchSize);
      sentForProcessing += batchSize;
      //console.log("Size of the batch:  " + JSON.stringify(batch).length + " bytes.");
      //console.log("Size of Locs: " + JSON.stringify(world.locations).length);


      var response = {"batch" : batch, "batchNumber" : batchNumber, "startingLocation" : sentForProcessing - batchSize, "stats" : world.stats, "timeStamp" : Date.now()};
      res.send(response);
      console.debug("Sent batch: " + batchNumber++);
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
    receivedBatches++;
    //console.log("Received actions: " + actions);
    //console.log("Currently processed " + doneProcessing.length + " out of " + world.animals.length + ".");


    
    if (receivedBatches * batchSize >= world.locations.length) {
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
  console.log(err.stack);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// -- Helper funtions


// Apply the actions from the animals to the world. Update animal location, energy level.
// Create the new animals, remove the dead ones.

function executeUpdate() {

    var startOfExecution = Date.now();
    var energyLoss = 2;
    var energyContent = 5;

    //console.log("Executing update.");
    doneProcessing = doneProcessing.flat();
    //console.log("flattened.");
    doneProcessing = doneProcessing.filter(function(el) {
        //console.log("EL: " + el);
        return (el != null && el.length > 0);
    });

    //console.log("filtered.");
    world.stats.actionsLastTick = doneProcessing.length;
    doneProcessing.forEach(action => {
        if (action[0].length == undefined) {
            world.worldActions[action[0]](action[1]);
        } else {
            // There are several actions in this actions!
            action.forEach(act => {
                world.worldActions[act[0]](act[1]);
            });
        }
    });

    // All actions have been processed.

    world.stats.animalsProcessed = 0;
    world.locations.filter(location => {return location != null;}).forEach(location => {
        location.forEach(animal => {
            // Remove the cost of the energy for animals that are alive and not plants
            // Alive: energy > 0. Not plant: Type > first quarter.
            if (animal.energy >= 0 && animal.genome.type > 1) {
                animal.energy -= energyLoss * animal.genome.size;
            } else {
                // General decay
                animal.energy -= energyLoss;
            }
            if (animal.energy <= 0 && animal.genome.tracts.length > 0) {
                // Killing the energy by removing its senses(tracts).
                animal.genome.tracts = [];
                animal.genome.type = 0;
                world.stats.animalsDead++;
            }
            if (animal.energy < -(energyContent * animal.genome.size)) {
                //Now the animal has been fully eaten, remove it from the world.
                //console.log("Removing a dead animal from the world, from location " + animal.location + " with length " + world.locations[animal.location].length);
                world.locations[animal.location].splice(world.locations[animal.location].indexOf(animal), 1);
                world.stats.animalsRemoved++;
            }
            world.stats.animalsProcessed++;
        });
    });

    // House keeping with the variables

    toBeProcessed = [];
    doneProcessing = [];
    sentForProcessing = 0;
    receivedBatches = 0;
    world.cycle += 1;
    //console.log("Time for a new cycle " + world.cycle + ", now with " + world.stats.animalsCreated + " animals.");
    world.stats.tickNr++;
    world.stats.tickDuration = Date.now() - startOfTick;
    world.stats.executionDuration = Date.now() - startOfExecution;
    world.stats.animalsTickedPerSecond = (world.stats.animalsProcessed * 1000) / world.stats.tickDuration;
    //console.log("Animal 1 status: " + world.animals[0].energy);
    startOfTick = 0;
}

module.exports = app;
