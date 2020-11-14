"use strict";

var hostData = {};
var canvas;
var ctx;
var gene = new Genome();

const radius = 80;
const origo = 500;


var idleTimeBeforeNextRequestAttempt = 100;


// This is the initial starting function that gets called from the browser
// When the simulation page is opened. It will initialize rendering
// variables and ask for a batch to process, starting the loop.
function processDataBatch() {
    var url = "processBatch";
    var method = "GET";
    var shouldBeAsync = true;
    var request = new XMLHttpRequest();
    var that = this;

    // Plot or replot the world
    canvas = document.getElementById("surface");
    ctx = canvas.getContext("2d");

    request.onload = function () {

        var status = request.status;
        if (status == 200) {
            var updatedData = request.responseText;

            if ('"status" : 0'.localeCompare(updatedData) == 0) {
                console.log("No data to be processed available. Idling for some time before asking again.");
                setTimeout(processDataBatch(), idleTimeBeforeNextRequestAttempt);
            } else {
                //console.log("Received data batch with length " + updatedData.length + ".");
                var batch = JSON.parse(updatedData);
                batch.size = updatedData.length;
                //console.log("Parsed data batch " + batch.batchNumber + ", created: " + (Date.now() - batch.timeStamp) + " ms ago.");
                executeAndSubmitResult(batch);
                //console.log("Processed and submitted the data from batch " + batch.batchNumber);
            }
        }
        else {
            console.log("Something went horribly wrong!");
        }

    }

    request.open(method, url, shouldBeAsync);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send();
    console.log("Asked for data to process.");
}

// This function executes the received animals in the batch and gathers
// their actions, which it submits to the world. Upon submition completion,
// new loop is triggered.
function executeAndSubmitResult(batchData) {
    //var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var url = "submitBatchProcessingResult";
    var method = "POST";
    var shouldBeAsync = true;
    var request = new XMLHttpRequest();
    var actions = runAnimals(batchData);

    request.onload = function () {
       var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
       if (status == 200) {

           // OK, time to schedule next cycle...
           setTimeout(processDataBatch(), 0);
       }
       else {
           console.log("Something went horribly wrong!");
       }
    }

    request.open(method, url, shouldBeAsync);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(actions));
}


// This function prepares the environment for each animal and executes it,
// obtaining the action that animal wishes to take.
function runAnimals(batchData) {

    var locations = batchData["batch"];
    //var animalBatch = batchData["batch"];
    var actions = [];
    var startingLocation = batchData["startingLocation"];
    var stats = batchData["stats"];
    
    stats.batchNumber = batchData["batchNumber"];
    stats.batchSendTime = batchData["timeStamp"];
    stats.batchReceptionTime = Date.now();
    stats.batchStartingLocation = startingLocation;
    stats.batchAnimalsProcessed = 0;
    stats.batchSize = batchData["size"];


    // parse through all animals, add 1
    var parsingStart = Date.now();
    var nonNullLocations = locations.filter( el => { return el !== null });
    console.log("Parsing took " + Date.now() - parsingStart); 
    
    var currentMoment = Date.now();
    nonNullLocations.forEach(location => {
        location.forEach(animal => {

            //console.log("Processing of last animal took " + (Date.now() - currentMoment));
            currentMoment = Date.now();
            // For this animal, go through each sense, check the impressions,
            // and for each impression, see if it triggers anything.
            // If it triggers, check if higher than affinity before. If so,
            // set highest chosen action.

            // Get the senses definition from the Genome instance (gene).
            var senses = gene.senses;
            var animalActions = [];

            //console.log(animal.genome.tracts);

            // Get number of senses by checking the tract first dimension
            var numberOfSenses = animal.genome.tracts.length;

            for (var sense = 0; sense < numberOfSenses; sense++) {
                var chosenTract;
                // get Impression from the sense, second method of the three.
                // returns the impression number as well as id of the "object" that caused the impression.
                var impressions = senses[sense][1]([locations, animal]);
                // if (sense == 0 && impressions.length > 0) {
                //     console.log("Sense is " + sense + ", seing " + impressions);
                // }

                // Check, for each impression, it any of the tracts is triggered.
                for (var i = 0; i < impressions.length; i++) {
                    var tractsOfThisSense = animal.genome.tracts[sense];
                    
                    for (var t = 0; t < tractsOfThisSense.length; t++) {
                        var tract = tractsOfThisSense[t];
                        var trigger = tract.trigger;
                        //console.log("Checking " + impressions[i][0] + " against tract " + trigger);

                        if (impressions[i][0] == trigger) {
                            //console.log("YES YES YES => triggered a tract with affinity " + tract.affinity);
                            if (chosenTract === undefined || (tract.affinity > chosenTract.affinity)) {
                                //console.log("YES YES YES => this tract is winning!");
                                chosenTract = tract;
                                chosenTract.objId = impressions[i][1].id;
                                chosenTract.location = impressions[i][1].location;

                            }
                        }
                    }
                }
                // We have now found a tract with highest affinity. Make a world action and add to actions.
                if (chosenTract !== undefined) {
                    if (chosenTract.location < startingLocation || chosenTract.location > startingLocation + locations.length)  {
                        console.log("The location of the object is beyond us.");
                    }

                    var index = chosenTract.location - startingLocation;
                    if (locations[index] === undefined) {
                        console.log("da hecka? Index is: " + index);
                    }
                    var animalThatCausedImpressions = locations[chosenTract.location - startingLocation].filter(obj => {
                        return obj.id === chosenTract.objId;
                    });



                    var chosenAction = senses[sense][2]([animal, chosenTract.action, animalThatCausedImpressions]);
                    animalActions.push(chosenAction);
                    //console.log("added action to world actions. " + actions);
                } else {
                    animalActions.push([]);
                }
            }

            actions.push(animalActions);
            stats.batchAnimalsProcessed ++;
        });
    });

    // Done with all actions.
    stats.batchProcessedTime = Date.now();
    stats.batchTotalActions = actions.length;

    // Update image
    
    updateImage(locations, stats);
    
    return actions;
}


// This function paints an update based on animal locations.
function updateImage(locations, stats) {

    stats.imageUpdateTimeStart = Date.now();

    ctx.beginPath();
    ctx.arc(origo, origo, radius, 0, 2 * Math.PI);
    ctx.stroke();

    locations.forEach(location => {
        var o = 0;
        var b = 0;
        if (location == null) return;
        location.forEach(animal => {

            if (animal == null) return;
            // Radius r
            // Tra  nslate location l into x, y on circle r
            // 2pi / max * location = angle
            
            if (animal.genome.type > 1) {
                if (b < origo) b += 1;
                ctx.fillStyle = "rgb(255, " + (animal.genome.type  * 32) + " , " + (animal.genome.shape * 32) + ")";
                var angle = Math.PI * animal.location * 2 / locations.length;
                var x = origo + Math.cos(angle) * (radius + b);
                var y = origo + Math.sin(angle) * (radius + b);
                ctx.fillRect( x, y, 2, 2 );
            }
            else {
                o += 1;
                if (o > radius) o = radius;
                ctx.fillStyle = "rgb(0, " + (animal.genome.type  * 32) + " , " + (animal.genome.shape * 32) + ")";
                var angle = Math.PI * animal.location * 2 / locations.length;
                var x = origo + Math.cos(angle) * (radius - o);
                var y = origo + Math.sin(angle) * (radius - o);
                ctx.fillRect( x, y, 2, 2 );
            }
            
        })
    })
    ctx.stroke();

    // Update stats
    // World stats
    document.getElementById("tickNr").innerHTML = stats.tickNr;
    document.getElementById("animalsCreated").innerHTML = stats.animalsCreated;
    document.getElementById("animalsDead").innerHTML = stats.animalsDead;
    document.getElementById("animalsRemoved").innerHTML = stats.animalsRemoved;
    document.getElementById("actionsLastTick").innerHTML = stats.actionsLastTick;
    document.getElementById("animalsProcessed").innerHTML = stats.animalsProcessed;
    document.getElementById("locationChanged").innerHTML = stats.locationChanged;
    document.getElementById("energyChanged").innerHTML = stats.energyChanged;
    document.getElementById("affinityChanged").innerHTML = stats.affinityChanged;
    document.getElementById("birthsGiven").innerHTML = stats.birthsGiven;
    document.getElementById("tickDuration").innerHTML = stats.tickDuration;
    document.getElementById("executionDuration").innerHTML = stats.executionDuration;
    document.getElementById("tickedPerSecond").innerHTML = stats.animalsTickedPerSecond;

    document.getElementById("batchNumber").innerHTML = stats.batchNumber;
    document.getElementById("batchStart").innerHTML = stats.batchStartingLocation;
    document.getElementById("batchTransportTime").innerHTML = stats.batchReceptionTime - stats.batchSendTime;
    document.getElementById("batchProcessingDuration").innerHTML = stats.batchProcessedTime - stats.batchReceptionTime;
    document.getElementById("batchSize").innerHTML = stats.batchSize;
    document.getElementById("transferSpeed").innerHTML = stats.batchSize / (stats.batchReceptionTime - stats.batchSendTime);
    document.getElementById("averageAnimalSize").innerHTML = stats.batchSize / stats.batchAnimalsProcessed;
    document.getElementById("batchAnimalsProcessed").innerHTML = stats.batchAnimalsProcessed;
    document.getElementById("batchTotalActions").innerHTML = stats.batchTotalActions;
    document.getElementById("imageUpdateTime").innerHTML = Date.now() - stats.imageUpdateTimeStart;
}
