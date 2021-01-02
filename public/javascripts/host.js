"use strict";

// ======================================================================================= //
// State Control Functions
// ======================================================================================= //


function startWorld() {
    document.getElementById("status").innerHTML = "Status: Creating world."
    window.world = new World();
    document.getElementById("status").innerHTML = "Status: World created."
}

function togglePauseWorld() {
    document.getElementById("status").innerHTML = window.world.running ? "Status: World paused." : "Status: World running.";
    window.world.running = !window.world.running;

    if (window.world.running === true) {
        tickWorld(window.world, presentWorldAndGetActions(window.world));
    }
}

function executeOneTick() {
    if (!window.world.running) {
        document.getElementById("status").innerHTML = "Status: executing one step.";

        tickWorld(window.world, presentWorldAndGetActions(window.world));
        document.getElementById("status").innerHTML = "Status: World paused.";
    }
}

function onRadioClick(radio) {
    window.world.stats.animalTypeMonitored = radio.value;
    console.log("Changed to: " + radio.value);
}






// This function paints an update based on animal locations.
function renderWorld(world) {

    const radius = 150;
    const origo = 350;
    var stats = world.stats;
    var locations = world.locations;
    var ctx = world.ctx;
    var above = 0;
    var below = 0;
    var animalMonitored = {};

    console.log("Updating image.");
    stats.imageUpdateTimeStart = Date.now();

    
    ctx.clearRect(0, 0, 700, 700);
    ctx.beginPath();
    ctx.arc(origo, origo, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // pick the animal that we are looking a bit extra at
    switch(stats.animalTypeMonitored) {
        case "age": 
            stats.animalMonitored = stats.longestLivingAnimal;
            break;
        case "highEnergy":
            stats.animalMonitored = stats.highestEnergyAnimal;
            break;
        case "increasedEnergy":
            stats.animalMonitored = stats.mostConsecutiveEnergyIncreases;
            break;
        case "mostKids":
            stats.animalMonitored = stats.mostKidsAnimal;
            break;
        default:
            console.log("Failed to find appropriate type of animal.");
            break;
    }

    locations.forEach(location => {
        var o = 0;
        var b = 0;
        if (location == null) return;
        location.forEach(being => {

            if (being == null) return;
            // Radius r
            // Translate location l into x, y on circle r
            // 2pi / max * location = angle
            
            if (being.isAnimal() && !being.isDead()) {
                above ++;
                b += 1;
                ctx.fillStyle = "rgb(255, " + (being.genome.type  * 32) + " , " + (being.genome.shape * 32) + ")";
                var angle = Math.PI * being.location * 2 / stats.worldSize;
                var x = origo + Math.cos(angle) * (radius + b);
                var y = origo + Math.sin(angle) * (radius + b);
                ctx.fillRect( x, y, 1, 1 );

                if (being.id == stats.animalMonitored.id) {
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.stroke();
                }

                if (being.id == stats.animalActedUpon.id) {
                    ctx.fillStyle = 'green';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.stroke();
                }

            }
            else {
                below ++;
                o += 1;
                if (o > radius) o = radius;
                ctx.fillStyle = "rgb(0, " + (being.genome.type  * 32) + " , " + (being.genome.shape * 32) + ")";
                var angle = Math.PI * being.location * 2 / stats.worldSize;
                var x = origo + Math.cos(angle) * (radius - o);
                var y = origo + Math.sin(angle) * (radius - o);
                ctx.fillRect( x, y, 1, 1 );
            }
            
        });
    });

    

    ctx.stroke();

    // Update stats
    // World stats
    document.getElementById("tickNr").innerHTML = stats.tickNr;

    document.getElementById("beingsAlive").innerHTML = stats.beingsAlive;
    document.getElementById("beingsCreated").innerHTML = stats.beingsCreated;
    document.getElementById("beingsDead").innerHTML = stats.beingsDead;
    document.getElementById("beingsRemoved").innerHTML = stats.beingsRemoved;
    document.getElementById("beingsProcessed").innerHTML = stats.beingsProcessed;

    document.getElementById("birthsGiven").innerHTML = stats.birthsGiven;
    document.getElementById("animalsCreated").innerHTML = stats.animalsCreated;
    document.getElementById("animalsAlive").innerHTML = stats.animalsAlive;
    document.getElementById("plantsCreated").innerHTML = stats.plantsCreated;
    document.getElementById("plantsAlive").innerHTML = stats.plantsAlive;

    document.getElementById("averageAnimalAge").innerHTML = Math.floor(stats.averageAnimalAge / stats.animalsProcessed);
    document.getElementById("averageDeadAnimalAge").innerHTML = Math.floor(stats.averageDeadAnimalAge / stats.animalsDeadThisTick);
    document.getElementById("animalsDeadThisTick").innerHTML = stats.animalsDeadThisTick;
    document.getElementById("oldestLivingAnimal").innerHTML = stats.longestLivingAnimal.age;

    document.getElementById("actionsLastTick").innerHTML = stats.actionsLastTick;

    document.getElementById("locationChanged").innerHTML = stats.locationChanged;
    document.getElementById("energyChanged").innerHTML = stats.energyChanged;
    document.getElementById("affinityChanged").innerHTML = stats.affinityChanged;
    document.getElementById("visionImpressionsChecked").innerHTML = stats.visionImpressionsChecked;
    document.getElementById("visionTriggersGenerated").innerHTML = stats.visionTriggersGenerated;
    document.getElementById("visionTriggeredPerAnimal").innerHTML = Math.floor(stats.visionTriggersGenerated / stats.animalsAlive * 100);
    
    document.getElementById("tickDuration").innerHTML = stats.tickDuration;
    document.getElementById("executionDuration").innerHTML = stats.executionDuration;
    document.getElementById("tickedPerSecond").innerHTML = stats.animalsTickedPerSecond;
    document.getElementById("imageUpdateTime").innerHTML = Date.now() - stats.imageUpdateTimeStart;
    document.getElementById("reboots").innerHTML = stats.reboots;

    document.getElementById("above").innerHTML = above;
    document.getElementById("below").innerHTML = below;

    // Longest living animal stats
    document.getElementById("animalMonitoredId").innerHTML = stats.animalMonitored.id;
    document.getElementById("animalMonitoredAge").innerHTML = stats.animalMonitored.age;
    document.getElementById("animalMonitoredLocation").innerHTML = stats.animalMonitored.location;
    document.getElementById("animalMonitoredEnergy").innerHTML = stats.animalMonitored.energy;
    document.getElementById("animalMonitoredKidsSpawned").innerHTML = stats.animalMonitored.numberOfKids;
    document.getElementById("animalMonitoredConsecutiveEnergyIncreases").innerHTML = stats.animalMonitored.consecutiveEnergyIncreases;
    document.getElementById("animalMonitoredSize").innerHTML = stats.animalMonitored.genome.size;
    document.getElementById("animalMonitoredType").innerHTML = stats.animalMonitored.genome.type;
    document.getElementById("animalMonitoredShape").innerHTML = stats.animalMonitored.genome.shape;
    document.getElementById("animalMonitoredLastImpressions").innerHTML = stats.animalMonitored.lastImpressions[0] + (stats.animalMonitored.lastImpressions[1] === undefined ? "" : ", " + stats.animalMonitored.lastImpressions[1].id);
    document.getElementById("animalMonitoredLastTrigger").innerHTML = stats.animalMonitored.lastTrigger;
    document.getElementById("animalMonitoredLastActions").innerHTML = actionsToText(stats.animalMonitored.lastActions);

    // Animal acted upon stats
    document.getElementById("animalActedUponId").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.id : "";
    document.getElementById("animalActedUponAge").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.age : "";
    document.getElementById("animalActedUponLocation").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.location : "";
    document.getElementById("animalActedUponEnergy").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.energy : "";
    document.getElementById("animalActedUponKidsSpawned").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.numberOfKids : "";
    document.getElementById("animalActedUponConsecutiveEnergyIncreases").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.consecutiveEnergyIncreases : "";
    document.getElementById("animalActedUponSize").innerHTML = stats.animalActedUpon.genome !== undefined ? stats.animalActedUpon.genome.size : "";
    document.getElementById("animalActedUponType").innerHTML = stats.animalActedUpon.genome !== undefined ? stats.animalActedUpon.genome.type : "";
    document.getElementById("animalActedUponShape").innerHTML = stats.animalActedUpon.genome !== undefined ? stats.animalActedUpon.genome.shape : "";
    //document.getElementById("animalActedUponLastImpressions").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.lastImpressions[0] + ", " + animalActedUpon.lastImpressions[1].id : "";
    //document.getElementById("animalActedUponLastTrigger").innerHTML = stats.animalActedUpon !== {} ? stats.animalActedUpon.lastTrigger : "";
    //document.getElementById("animalActedUponLastActions").innerHTML = stats.animalActedUpon !== {} ? actionsToText(stats.animalActedUpon.lastActions) : "";

}   

function actionsToText(actions) {
    var result = "";
    actions.forEach(action => {
        if (action.length > 0) {
            if (action[0].length !== undefined) {
                // Multiple actions, need to iterate
                for (var a = 0; a < action.length; a++) {
                    var subaction = action[a];
                    switch (subaction[0]) {
                        case 0:
                            result += "Move " + Math.abs(subaction[1][1]) + " to the " + (subaction[1][1] <= 0 ? " left.\n" : " right.\n");
                            break;
                        case 1:
                            result += "Animal " + subaction[1][0].id + " changes energy " + subaction[1][1] + "\n";
                            break;
                        case 2:
                            result += "Affinity " + subaction[1][1] + "/" + subaction[1][2] + " adjusted " + subaction[1][3] + ".\n";
                            break;
                        case 3:
                            result += "Spawning " + subaction[1][1] + " kids with energy " + subaction[1][2] + "\n";
                            break;
                
                        default:
                            break;
                    }
                }
            } else {
                // Not a multiple action array
                switch (action[0]) {
                    case 0:
                        result += "Move " + Math.abs(action[1][1]) + " to the " + (action[1][1] <= 0 ? " left.\n" : " right.\n");
                        break;
                    case 1:
                        result += "Animal " + action[1][0].id + " changes energy " + action[1][1] + "\n";
                        break;
                    case 2:
                        result += "Affinity " + action[1][1] + "/" + action[1][2] + " adjusted " + action[1][3] + ".\n";
                        break;
                    case 3:
                        result += "Spawning " + action[1][1] + " kids with energy " + action[1][2] + "\n";
                        break;
            
                    default:
                        break;
                }
            }
        }
    });
    return result;
}


/*

This was old host, now kept temporarily for legacy reasons.


var hostData = {};
var canvas;
var ctx;



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
*/


