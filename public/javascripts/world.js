"use strict";

(function (exports) {

    const world_size = 500;
    const energy_norm = 1000;
    

    //const init_ener = 100;


    function World() {
        this.cycle = 0;
        this.locations = [];
        this.worldActions = [];
        this.stats = {};
        this.stats.tickNr = 0;
        this.stats.beingsCreated = 0;
        this.stats.beingsAlive = 0;
        this.stats.beingsDead = 0;
        this.stats.beingsRemoved = 0;
        this.stats.locationChanged = 0;
        this.stats.energyChanged = 0;
        this.stats.affinityChanged = 0;
        this.stats.birthsGiven = 0;
        this.stats.animalsCreated = 0;
        this.stats.plantsCreated = 0;
        this.stats.animalsAlive = 0;
        this.stats.plantsAlive = 0;
        this.stats.worldSize = world_size;
        this.running = false;

        this.target_beings = 1550;

        console.log("Starting world.");

        // Plot or replot the world
        this.canvas = document.getElementById("surface");
        this.ctx = this.canvas.getContext("2d");


        // Setup world
        setupWorld(this);

        // create Initial creatures
        for (var i = 0; i < this.target_beings; i++) {
            this.createNewRandomAnimal();
        }
        console.log("World created.");
    }


    World.prototype.createNewRandomAnimal = function () {
        //console.log("New random animal.");
        var genome = new Genome();
        var init_energy = getRandomInt(energy_norm) * (genome.size + 1);
        var being = new Being(this.stats.beingsCreated++, init_energy, genome, this.stats.beingsCreated % 2);
        if (being.genome.type > 1) {
            this.stats.beingsAlive++;
            this.stats.animalsCreated++;
            this.stats.animalsAlive++;
        } else {
            this.stats.beingsAlive++;
            this.stats.plantsCreated++;
            this.stats.plantsAlive++;
        }
        this.addToLocation(getRandomLocation(), being);

    }

    World.prototype.addToLocation = function (location, being) {
        if (this.locations[location] != null) {
            if (being in this.locations[location]) {
                console.log("Animal already in this location!");
                //Check also if correct on animal
                if (being.location != location) {
                    console.log("The animal has wrong locations recorded! Fixing...");
                    being.location = location;
                }
                return;
            } else {
                this.locations[location].push(being);
                being.location = location;
            }
        } else {
            // Nothing yet in the location, will need to create interval
            this.locations[location] = [];
            this.locations[location].push(being);
            being.location = location;
            console.log("Created a new location " + location + " array and added an animal " + being.id);
        }
    }

    World.prototype.remove = function (location, animal) {
        console.log("Removing the animal.... not implemented yet!");
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }


    function getRandomLocation() {
        return getRandomInt(world_size);
    }

    function checkCorrectLocation(animal, locations) {
        for (var i = 0; i < locations[animal.location].length; i++) {
            if (locations[animal.location][i].id = animal.id) {
                return true;
            }
        }

        return false;
    }

    function setupWorld(world) {
        // Populating the world with actions
        // The world currently contains the follwing actions:
        // changeLocation, changeEnergy, changeAffinity, giveBirth

        // Change location will take locations, animal, delta as params.
        var changeLocation = function (params) {
            if (params.length != 2) {
                console.log("Wrong amount of params given to changeLocation action!");
                return;
            }


            // Assign the args
            var being = params[0];
            var locationDelta = params[1];

            console.log("Changing location for animal " + being.id + " with delta " + locationDelta);
            //console.log("Current animal localtion is: " + animal.location + ", in world location: " + world.locations[animal.location]);

            // Check that the animal is in the location it says it is.
            if (checkCorrectLocation(being, world.locations)) {
                var newLocation = (being.location + locationDelta) % world_size;
                
                // Update the location, and the animal location.
                // First, remove the animal from the location it is in.
                world.locations[being.location].splice(world.locations[being.location].indexOf(being), 1);
                
                // Then, add it to the new location.
                world.addToLocation(newLocation, being);

                console.log("New location is: " + being.location);
                world.stats.locationChanged++;
            } else {
                console.log("Something is corrupted, the location of the animal is wrong.");
            }
        }

        var changeEnergy = function (params) {
            if (params.length != 2) {
                console.log("Wrong amount of params given to changeEnergy action!");
                return;
            }

            var being = params[0];
            var energyDelta = params[1];

            being.energy += energyDelta;
            world.stats.energyChanged++;
        }

        var changeAffinity = function (params) {
            if (params.length != 4) {
                console.log("Wrong amount of params given to changeAffinity action!");
                return;
            }

            var being = params[0];
            var sense = params[1];
            var tract = params[2];
            var delta = params[3];

            // Adjust the affinities
            being.affinities[sense][tract] += delta;
            world.stats.affinityChanged++;
        }

        var giveBirth = function (params) {
            if (params.length != 3) {
                console.log("Wrong amount of params given to giveBirth action!");
                return;
            }

            // At this point, we are just duplicating. Mutations will be added Later
            var being = params[0];
            var numberOfKids = params[1];
            var energyPercentage = params[2];

            var energyGiven = Math.floor(being.energy * 0.15 * energyPercentage);

            being.energy -= energyGiven;
            var energyPerKid = Math.floor(energyGiven / numberOfKids);

            

            for (var i = 0; i < numberOfKids; i++) {
                var child = new Being(world.stats.beingsCreated, energyPerKid, being.genome, being.orientation);
                if (child.isAnimal()) {
                    world.stats.beingsCreated ++;
                    world.stats.animalsCreated ++;
                    world.stats.animalsAlive ++;
                } else {
                    world.stats.beingsCreated ++;
                    world.stats.plantsCreated ++;
                    world.stats.plantsAlive ++;
                }
                world.addToLocation(being.location, child);
            }

            world.stats.birthsGiven += numberOfKids;
            world.stats.beingsAlive += numberOfKids;
        }

        world.worldActions.push(changeLocation);
        world.worldActions.push(changeEnergy);
        world.worldActions.push(changeAffinity);
        world.worldActions.push(giveBirth);

        // Create genes?

    }


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning World!");
        module.exports = World;
    } else {
        //this['Genome']={};
        window.World = World;
    }


}) ();
    
// ======================================================================================= //
// Other functions
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

// This function prepares the environment for each being and executes it,
// obtaining the action that being wishes to take.
function presentWorldAndGetActions(world) {

    var locations = world.locations;
    var actions = [];
    var stats = world.stats;
    
    stats.tickStartTime = Date.now();
    stats.visionTriggersGenerated = 0;
    stats.visionImpressionsChecked = 0;

    // parse through all beings, add 1
    var parsingStart = Date.now();
    //var nonNullLocations = locations.filter( el => { return el !== null });
    //console.log("Parsing took " + Date.now() - parsingStart); 
    
    var currentMoment = Date.now();
    locations.forEach(location => {
        if (location != null) {
            location.forEach(being => {

                currentMoment = Date.now();
                // For this being, go through each sense, check the impressions,
                // and for each impression, see if it triggers anything.
                // If it triggers, check if higher than affinity before. If so,
                // set highest chosen action.

                // Get the senses definition from the Genome instance (gene).
                var senses = gene.senses;
                var beingActions = [];

                // Get number of senses by checking the tract first dimension
                var numberOfSenses = being.genome.tracts.length;

                for (var sense = 0; sense < numberOfSenses; sense++) {
                    var chosenTract;
                    // get Impression from the sense, second method of the three.
                    // returns the impression number as well as id of the "object" that caused the impression.
                    var impressions = senses[sense][1]([locations, being]);
                    // if (sense == 0 && impressions.length > 0) {
                    //     console.log("Sense is " + sense + ", seing " + impressions);
                    // }

                    // Check, for each impression, it any of the tracts is triggered.
                    for (var i = 0; i < impressions.length; i++) {
                        var tractsOfThisSense = being.genome.tracts[sense];

                        if (sense == 0) stats.visionImpressionsChecked++;
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
                                    
                                    // No need to continue checking
                                    if (sense == 0) stats.visionTriggersGenerated++;
                                    break;
                                }
                            }
                        }
                    }
                    // We have now found a tract with highest affinity. Make a world action and add to actions.
                    if (chosenTract !== undefined) {
                        var beingThatCausedImpressions = locations[chosenTract.location].filter(obj => {
                            return obj.id === chosenTract.objId;
                        });

                        var chosenAction = senses[sense][2]([being, chosenTract.action, beingThatCausedImpressions]);
                        beingActions.push(chosenAction);
                    } else {
                        beingActions.push([]);
                    }

                    if (sense == 0) {
                        being.lastImpressions = impressions;
                    }
                }


                
                being.lastActions = beingActions;
                actions.push(beingActions);
            });
        }
    });

    // Done with all actions.
    stats.batchProcessedTime = Date.now() - parsingStart;
    stats.batchTotalActions = actions.length;

    return actions;
}

// Apply all the actions from beings on the world. 
function tickWorld(world, actions) {

    var startOfExecution = Date.now();
    
    actions = actions.flat().filter(function(el) {
        return (el != null && el.length > 0);
    });

    world.stats.actionsLastTick = actions.length;
    actions.forEach(action => {
        if (action[0].length == undefined) {
            world.worldActions[action[0]](action[1]);
        } else {
            // There are several actions in this actions!
            action.forEach(act => {
                world.worldActions[act[0]](act[1]);
            });
        }
    });

    // All actions have been applied to the world.
    world.stats.beingsProcessed = 0;
    world.stats.animalsProcessed = 0;
    world.stats.averageAnimalAge = 0;
    world.stats.averageDeadAnimalAge = 0;
    world.stats.animalsDeadThisTick = 0;
    world.stats.oldestLivingAnimal = 0;

    world.locations.filter(location => {return location != null;}).forEach(location => {
        location.forEach(being => {
            // Remove the cost of the energy for animals that are alive and not plants
            // Alive: energy > 0. Not plant: Type > first quarter.
            being.tick();

            // Check if being is dead
            if (being.checkForDeath()) {
                world.stats.beingsDead++;
                world.stats.beingsAlive--;

                if (being.isAnimal()) {
                    world.stats.animalsAlive--;
                    world.stats.averageDeadAnimalAge += being.age;
                    world.stats.animalsDeadThisTick ++;
                } else {
                    world.stats.plantsAlive--;
                }
            }

            if (being.isAnimal() && !being.isDead()) {
                world.stats.averageAnimalAge += being.age;
                world.stats.animalsProcessed ++;
                if (being.age > world.stats.oldestLivingAnimal) {
                    world.stats.lla = being;
                }
            }

            if (being.isDecomposed()) {
                //Now the animal has been fully eaten, remove it from the world.
                //console.log("Removing a dead animal from the world, from location " + animal.location + " with length " + world.locations[animal.location].length);
                world.locations[being.location].splice(world.locations[being.location].indexOf(being), 1);
                world.stats.beingsRemoved++;
            }


            // Replenish the world if necessary
            if (world.stats.beingsAlive < (world.target_beings / 2)) {
                // Create some more beings
                for (var i = 0; i < (world.target_beings / 2); i++) {
                    world.createNewRandomAnimal();
                }
            }

            world.stats.beingsProcessed++;
        });
    });

    // House keeping with the variables

    world.stats.tickNr++;
    world.stats.tickDuration = Date.now() - world.stats.tickStartTime;
    world.stats.executionDuration = Date.now() - startOfExecution;
    world.stats.animalsTickedPerSecond = Math.floor((world.stats.beingsProcessed * 1000) / world.stats.tickDuration);

    // To avoid division by zero... but maybe not eve

    // Update image
    updateImage(world);

    if (world.stats.animalsAlive && world.running > 0) 
        window.setTimeout(function() {tickWorld(world, presentWorldAndGetActions(world));}, 1);
}


// This function paints an update based on animal locations.
function updateImage(world) {

    const radius = 150;
    const origo = 500;
    var stats = world.stats;
    var locations = world.locations;
    var ctx = world.ctx;
    var above = 0;
    var below = 0;

    console.log("Updating image.");
    stats.imageUpdateTimeStart = Date.now();

    
    ctx.clearRect(0, 0, 700, 700);
    ctx.beginPath();
    ctx.arc(origo, origo, radius, 0, 2 * Math.PI);
    ctx.stroke();

    locations.forEach(location => {
        var o = 0;
        var b = 0;
        if (location == null) return;
        location.forEach(being => {

            if (being == null) return;
            // Radius r
            // Tra  nslate location l into x, y on circle r
            // 2pi / max * location = angle
            
            if (being.isAnimal() && !being.isDead()) {
                above ++;
                b += 2;
                ctx.fillStyle = "rgb(255, " + (being.genome.type  * 32) + " , " + (being.genome.shape * 32) + ")";
                var angle = Math.PI * being.location * 2 / stats.worldSize;
                var x = origo + Math.cos(angle) * (radius + b);
                var y = origo + Math.sin(angle) * (radius + b);
                ctx.fillRect( x, y, 1, 1 );
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

    document.getElementById("averageAnimalAge").innerHTML = stats.averageAnimalAge / stats.animalsProcessed;
    document.getElementById("averageDeadAnimalAge").innerHTML = stats.averageDeadAnimalAge / stats.animalsDeadThisTick;
    document.getElementById("animalsDeadThisTick").innerHTML = stats.animalsDeadThisTick;
    document.getElementById("oldestLivingAnimal").innerHTML = stats.lla.age;

    document.getElementById("actionsLastTick").innerHTML = stats.actionsLastTick;

    document.getElementById("locationChanged").innerHTML = stats.locationChanged;
    document.getElementById("energyChanged").innerHTML = stats.energyChanged;
    document.getElementById("affinityChanged").innerHTML = stats.affinityChanged;
    document.getElementById("visionImpressionsChecked").innerHTML = stats.visionImpressionsChecked;
    document.getElementById("visionTriggersGenerated").innerHTML = stats.visionTriggersGenerated;
    document.getElementById("visionTriggeredPerAnimal").innerHTML = stats.visionTriggersGenerated / stats.animalsAlive;
    
    document.getElementById("tickDuration").innerHTML = stats.tickDuration;
    document.getElementById("executionDuration").innerHTML = stats.executionDuration;
    document.getElementById("tickedPerSecond").innerHTML = stats.animalsTickedPerSecond;
    document.getElementById("imageUpdateTime").innerHTML = Date.now() - stats.imageUpdateTimeStart;

    document.getElementById("above").innerHTML = above;
    document.getElementById("below").innerHTML = below;

    // Longest living animal stats
    document.getElementById("llaId").innerHTML = stats.lla.id;
    document.getElementById("llaAge").innerHTML = stats.lla.age;
    document.getElementById("llaEnergy").innerHTML = stats.lla.energy;
    document.getElementById("llaSize").innerHTML = stats.lla.genome.size;
    document.getElementById("llaType").innerHTML = stats.lla.genome.type;
    document.getElementById("llaShape").innerHTML = stats.lla.genome.shape;
    document.getElementById("llaLastImpressions").innerHTML = stats.lla.lastImpressions;
    document.getElementById("llaLastActions").innerHTML = stats.lla.lastActions;


}   

