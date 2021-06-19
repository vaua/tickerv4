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

        console.log("World created.");
    }


    World.prototype.createNewRandomAnimal = function () {
        //console.log("New random animal.");
        var genome = new Genome();
        var init_energy = getRandomInt(energy_norm) * (genome.size + 1);
        var being = new Being(this.stats.beingsCreated++, init_energy, genome, this.stats.beingsCreated % 2);
        
        updateStatsBeingCreated(this, being);
        this.addToLocation(getRandomLocation(), being);
    }

    World.prototype.createSpecificBeing = function (being, location) {
        updateStatsBeingCreated(this, being);
        this.addToLocation(location, being);
    }

    function updateStatsBeingCreated(world, being) {
        if (being.genome.type > 1) {
            world.stats.beingsAlive++;
            world.stats.animalsCreated++;
            world.stats.animalsAlive++;
        } else {
            world.stats.beingsAlive++;
            world.stats.plantsCreated++;
            world.stats.plantsAlive++;
        }
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

    // This function prepares the environment for each being and executes it,
    // obtaining the action that being wishes to take.
    World.prototype.presentWorldAndGetActions = function () {

        var locations = this.locations;
        var actions = [];
        var stats = this.stats;
        
        stats.tickStartTime = Date.now();
        stats.visionTriggersGenerated = 0;
        stats.visionImpressionsChecked = 0;
        this.stats.animalActedUpon = {};

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

    // Apply all the actions from beings on the world. 
    World.prototype.tick = function (actions) {

        var startOfExecution = Date.now();
        
        actions = actions.flat().filter(function(el) {
            return (el != null && el.length > 0);
        });

        this.stats.actionsLastTick = actions.length;
        actions.forEach(action => {
            if (action[0].length == undefined) {
                this.worldActions[action[0]](action[1]);
            } else {
                // There are several actions in this actions!
                action.forEach(act => {
                    this.worldActions[act[0]](act[1]);
                });
            }
        });

        // All actions have been applied to the world.
        this.stats.beingsProcessed = 0;
        this.stats.animalsProcessed = 0;
        this.stats.averageAnimalAge = 0;
        this.stats.averageDeadAnimalAge = 0;
        this.stats.animalsDeadThisTick = 0;

        // Different animal types tracked
        this.stats.longestLivingAnimal = {};
        this.stats.longestLivingAnimal.age = 0;
        this.stats.mostKidsAnimal = {};
        this.stats.mostKidsAnimal.numberOfKids = 0;
        this.stats.highestEnergyAnimal = {};
        this.stats.highestEnergyAnimal.energy = 0;
        this.stats.mostConsecutiveEnergyIncreases = {};
        this.stats.mostConsecutiveEnergyIncreases.consecutiveEnergyIncreases = 0;
        

        this.locations.filter(location => {return location != null;}).forEach(location => {
            location.forEach(being => {
                // Remove the cost of the energy for animals that are alive and not plants
                // Alive: energy > 0. Not plant: Type > first quarter.
                being.tick();

                // Check if being is dead
                if (being.checkForDeath()) {
                    this.stats.beingsDead++;
                    this.stats.beingsAlive--;

                    if (being.isAnimal()) {
                        this.stats.animalsAlive--;
                        this.stats.averageDeadAnimalAge += being.age;
                        this.stats.animalsDeadThisTick ++;
                    } else {
                        this.stats.plantsAlive--;
                    }
                }

                if (being.isAnimal() && !being.isDead()) {
                    this.stats.averageAnimalAge += being.age;
                    this.stats.animalsProcessed ++;
                    if (being.age > this.stats.longestLivingAnimal.age) {
                        this.stats.longestLivingAnimal = being;
                    }
                    if (being.numberOfKids > this.stats.mostKidsAnimal.numberOfKids) {
                        this.stats.mostKidsAnimal = being;
                    }
                    if (being.energy > this.stats.highestEnergyAnimal.energy) {
                        this.stats.highestEnergyAnimal = being;
                    }

                    if (being.consecutiveEnergyIncreases > this.stats.mostConsecutiveEnergyIncreases.consecutiveEnergyIncreases) {
                        this.stats.mostConsecutiveEnergyIncreases = being;
                    }
                }

                if (being.isDecomposed()) {
                    //Now the animal has been fully eaten, remove it from the world.
                    //console.log("Removing a dead animal from the world, from location " + animal.location + " with length " + this.locations[animal.location].length);
                    this.locations[being.location].splice(this.locations[being.location].indexOf(being), 1);
                    this.stats.beingsRemoved++;
                }


                // Replenish the world if necessary
                if (do_reboots) {
                    if (this.stats.animalsAlive < reboot_limit) {
                        // Create some more beings
                        var new_limit = getRandomInt(target_beings * 2);
                        for (var i = 0; i < new_limit; i++) {
                            this.createNewRandomAnimal();
                        }
                        this.stats.reboots++;
                    }
                }
                
                this.stats.beingsProcessed++;
            });
        });

        // House keeping with the variables

        this.stats.tickNr++;
        this.stats.tickDuration = Date.now() - this.stats.tickStartTime;
        this.stats.executionDuration = Date.now() - startOfExecution;
        this.stats.animalsTickedPerSecond = Math.floor((this.stats.beingsProcessed * 1000) / this.stats.tickDuration);

        // Update image
        renderWorld(this);

        this.stats.animalActedUpon = {};
        if (this.stats.animalsAlive && this.running > 0) 
            var that = this;
            window.setTimeout(function() {that.tick(that.presentWorldAndGetActions());}, wait_between_ticks_to_avoid_overheating_ms);
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

