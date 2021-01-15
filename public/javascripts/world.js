"use strict";

(function (exports) {

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
        this.stats.animalTypeMonitored = "age";
        this.running = false;
        this.stats.reboots = 0;

        this.target_beings = target_beings;

        console.log("Starting world.");

        // Plot or replot the world
        this.canvas = document.getElementById("surface");
        this.ctx = this.canvas.getContext("2d");


        // Setup world
        window.Action.initiateWorldActions(this);

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
            for (var l = 0; l < this.locations[location].length; l++) {
                if (this.locations[location][l].id == being.id) {
                    console.log("There is an object with this exact ID already in the bussom.");
                }
            }
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
        }
    }

    World.prototype.checkCorrectLocation = function (being) {
        for (var i = 0; i < this.locations[being.location].length; i++) {
            if (this.locations[being.location][i].id == being.id) {
                return true;
            }
        }

        return false;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function getRandomLocation() {
        return getRandomInt(world_size);
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning World!");
        module.exports = World;
    } else {
        window.World = World;
    }


}) ();
   

function getBeingIndex(being, location) {
    return location.findIndex(function(b) {return b.id == being.id});
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
    world.stats.animalActedUpon = {};

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
                //var senses = gene.senses;
                var beingActions = [];

                if (being.hasSenses()) {

                    being.getSensesArray().forEach(sense => {
                        var chosenTract;
                        var affectedObjectId;
                        var affectedObjectLocation;

                        // get Impression from the sense, second method of the three.
                        // returns the impression number as well as id of the "object" that caused the impression.
                        var impressions = window.Sense.getImpressionsForSense(sense)([locations, being]);

                        // Check, for each impression, it any of the tracts is triggered.
                        for (var i = 0; i < impressions.length; i++) {
                            var tractsOfThisSense = being.genome.tracts[sense];

                            if (sense == 0) stats.visionImpressionsChecked++;
                            for (var t = 0; t < tractsOfThisSense.length; t++) {
                                var tract = tractsOfThisSense[t];
                                var trigger = tract.trigger;
                                //console.log("Checking " + impressions[i][0] + " against tract " + trigger);

                                // Check if impression triggers the specific trigger
                                if (checkIfImpressionTriggersTrigger(impressions[i][0], trigger, sense)) {
                                    //console.log("YES YES YES => triggered a tract with affinity " + tract.affinity);

                                    if (chosenTract === undefined || (tract.affinity > chosenTract.affinity)) {
                                        
                                        //console.log("YES YES YES => this tract is winning!");
                                        chosenTract = tract;
                                        affectedObjectId = impressions[i][1].id;
                                        affectedObjectLocation = impressions[i][1].location;
                                        
                                        // No need to continue checking
                                        if (sense == 0) {
                                            stats.visionTriggersGenerated++;
                                            being.lastImpressions = impressions[i];
                                            being.lastTrigger = trigger;
                                            if (stats.animalMonitored !== undefined) {
                                                if (stats.animalMonitored.id === being.id) {
                                                    stats.animalActedUpon = impressions[i][1];  
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        // We have now found a tract with highest affinity. Make a world action and add to actions.
                        if (chosenTract !== undefined) {
                            var beingThatCausedImpressions = locations[affectedObjectLocation].filter(obj => {
                                return obj.id === affectedObjectId;
                            });


                            var chosenAction = window.Sense.getActionsForSense(sense)([being, chosenTract.action, beingThatCausedImpressions]);

                            beingActions.push(chosenAction);
                        } else {
                            beingActions.push([]);
                        }
                    });
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

function checkIfImpressionTriggersTrigger(impression, trigger, sense) {
    if (sense == 0) {
        if (trigger.length != 3 || impression.length != 3) {
            console.log("Bad call MOFO!");
        }

        if (trigger[1] == 0 && trigger[2] == 0) {
            var result = impression[0] == trigger[0];
            return result;
        } else if (trigger[2] == 0) {
            var result = (impression[0] == trigger[0] && impression[1] == trigger[1]);
            return result;
        } 

        var result = (impression[0] == trigger[0] && impression[1] == trigger[1] && impression[2] == trigger[2]);
        return result;
    } 

    return impression == trigger;
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

    // Different animal types tracked
    world.stats.longestLivingAnimal = {};
    world.stats.longestLivingAnimal.age = 0;
    world.stats.mostKidsAnimal = {};
    world.stats.mostKidsAnimal.numberOfKids = 0;
    world.stats.highestEnergyAnimal = {};
    world.stats.highestEnergyAnimal.energy = 0;
    world.stats.mostConsecutiveEnergyIncreases = {};
    world.stats.mostConsecutiveEnergyIncreases.consecutiveEnergyIncreases = 0;
    

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
                if (being.age > world.stats.longestLivingAnimal.age) {
                    world.stats.longestLivingAnimal = being;
                }
                if (being.numberOfKids > world.stats.mostKidsAnimal.numberOfKids) {
                    world.stats.mostKidsAnimal = being;
                }
                if (being.energy > world.stats.highestEnergyAnimal.energy) {
                    world.stats.highestEnergyAnimal = being;
                }

                if (being.consecutiveEnergyIncreases > world.stats.mostConsecutiveEnergyIncreases.consecutiveEnergyIncreases) {
                    world.stats.mostConsecutiveEnergyIncreases = being;
                }
            }

            if (being.isDecomposed()) {
                //Now the animal has been fully eaten, remove it from the world.
                //console.log("Removing a dead animal from the world, from location " + animal.location + " with length " + world.locations[animal.location].length);
                world.locations[being.location].splice(world.locations[being.location].indexOf(being), 1);
                world.stats.beingsRemoved++;
            }


            // Replenish the world if necessary
            if (do_reboots) {
                if (world.stats.animalsAlive < reboot_limit) {
                    // Create some more beings
                    var new_limit = getRandomInt(target_beings * 2);
                    for (var i = 0; i < new_limit; i++) {
                        world.createNewRandomAnimal();
                    }
                    world.stats.reboots++;
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

    // Update image
    renderWorld(world);

    world.stats.animalActedUpon = {};
    if (world.stats.animalsAlive && world.running > 0) 
        window.setTimeout(function() {tickWorld(world, presentWorldAndGetActions(world));}, wait_between_ticks_to_avoid_overheating_ms);
}