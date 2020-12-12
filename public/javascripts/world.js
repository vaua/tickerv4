"use strict";

(function (exports) {

    const world_size = 5000;
    const init_animals = 15000;
    const energy_norm = 100;

    //const init_ener = 100;


    function World() {
        this.cycle = 0;
        this.locations = [];
        this.worldActions = [];
        this.stats = {};
        this.stats.tickNr = 0;
        this.stats.animalsCreated = 0;
        this.stats.animalsDead = 0;
        this.stats.animalsRemoved = 0;
        this.stats.locationChanged = 0;
        this.stats.energyChanged = 0;
        this.stats.affinityChanged = 0;
        this.stats.birthsGiven = 0;
        this.stats.animalsAlive = 0;
        this.stats.worldSize = world_size;

        console.log("Starting world.");

        // Plot or replot the world
        this.canvas = document.getElementById("surface");
        this.ctx = this.canvas.getContext("2d");


        // Setup world
        setupWorld(this);

        // create Initial creatures
        this.createInitialCreatures();
        console.log("World created.");
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
            var animal = params[0];
            var locationDelta = params[1];

            console.log("Changing location for animal " + animal.id + " with delta " + locationDelta);
            //console.log("Current animal localtion is: " + animal.location + ", in world location: " + world.locations[animal.location]);

            // Check that the animal is in the location it says it is.
            if (checkCorrectLocation(animal, world.locations)) {
                var newLocation = (animal.location + locationDelta) % world_size;
                
                // Update the location, and the animal location.
                // First, remove the animal from the location it is in.
                world.locations[animal.location].splice(world.locations[animal.location].indexOf(animal), 1);
                
                // Then, add it to the new location.
                world.addToLocation(newLocation, animal);

                console.log("New location is: " + animal.location);
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

            var animal = params[0];
            var energyDelta = params[1];

            animal.energy += energyDelta;
            world.stats.energyChanged++;
        }

        var changeAffinity = function (params) {
            if (params.length != 4) {
                console.log("Wrong amount of params given to changeAffinity action!");
                return;
            }

            var animal = params[0];
            var sense = params[1];
            var tract = params[2];
            var delta = params[3];

            // Adjust the affinities
            animal.affinities[sense][tract] += delta;
            world.stats.affinityChanged++;
        }

        var giveBirth = function (params) {
            if (params.length != 3) {
                console.log("Wrong amount of params given to giveBirth action!");
                return;
            }

            // At this point, we are just duplicating. Mutations will be added Later
            var animal = params[0];
            var numberOfKids = params[1];
            var energyPercentage = params[2];

            var energyGiven = Math.floor(animal.energy * 0.15 * energyPercentage);

            animal.energy -= energyGiven;
            var energyPerKid = Math.floor(energyGiven / numberOfKids);

            for (var i = 0; i < numberOfKids; i++) {
                var child = new Animal(world.stats.animalsCreated, energyPerKid, animal.genome, animal.orientation);
                world.stats.animalsCreated += 1;
                world.addToLocation(animal.location, child);
            }

            world.stats.birthsGiven += numberOfKids;
            world.stats.animalsAlive += numberOfKids;
        }

        world.worldActions.push(changeLocation);
        world.worldActions.push(changeEnergy);
        world.worldActions.push(changeAffinity);
        world.worldActions.push(giveBirth);

        // Create genes?

    }

    World.prototype.createInitialCreatures = function () {
        for (var i = 0; i < init_animals; i++) {
            this.createNewRandomAnimal();
            this.stats.animalsAlive ++;
        }
    }

    World.prototype.createNewRandomAnimal = function () {
        //console.log("New random animal.");
        var genome = new Genome();
        var init_energy = getRandomInt(energy_norm) * genome.size
        var animal = new Animal(this.stats.animalsCreated++, init_energy, genome, this.stats.animalsCreated % 2);
        this.addToLocation(getRandomLocation(), animal);

    }

    World.prototype.addToLocation = function (location, animal) {
        if (this.locations[location] != null) {
            if (animal in this.locations[location]) {
                console.log("Animal already in this location!");
                //Check also if correct on animal
                if (animal.location != location) {
                    console.log("The animal has wrong locations recorded! Fixing...");
                    animal.location = location;
                }
                return;
            } else {
                this.locations[location].push(animal);
                animal.location = location;
            }
        } else {
            // Nothing yet in the location, will need to create interval
            this.locations[location] = [];
            this.locations[location].push(animal);
            animal.location = location;
            console.log("Created a new location " + location + " array and added an animal " + animal.id);
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

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning World!");
        module.exports = World;
    } else {
        //this['Genome']={};
        window.World = World;
    }
}) ();
    
function startWorld() {
    var world = new World();

    executeUpdate(world, runAnimals(world));
}


// This function prepares the environment for each animal and executes it,
// obtaining the action that animal wishes to take.
function runAnimals(world) {

    var locations = world.locations;
    var actions = [];
    var stats = world.stats;
    
    stats.tickStartTime = Date.now();
    stats.tickAnimalsProcessed = 0;


    // parse through all animals, add 1
    var parsingStart = Date.now();
    //var nonNullLocations = locations.filter( el => { return el !== null });
    //console.log("Parsing took " + Date.now() - parsingStart); 
    
    var currentMoment = Date.now();
    locations.forEach(location => {
        if (location != null) {
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
                        var animalThatCausedImpressions = locations[chosenTract.location].filter(obj => {
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
        }
    });

    // Done with all actions.
    stats.batchProcessedTime = Date.now();
    stats.batchTotalActions = actions.length;

    return actions;
}

function executeUpdate(world, actions) {

    var startOfExecution = Date.now();
    var energyLoss = 2;
    var energyContent = 5;

    //console.log("Executing update.");
    actions = actions.flat();
    //console.log("flattened.");
    actions = actions.filter(function(el) {
        //console.log("EL: " + el);
        return (el != null && el.length > 0);
    });

    //console.log("filtered.");
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
                world.stats.animalsAlive--;
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

    world.stats.tickNr++;
    world.stats.tickDuration = Date.now() - world.stats.tickStartTime;
    world.stats.executionDuration = Date.now() - startOfExecution;
    world.stats.animalsTickedPerSecond = Math.floor((world.stats.animalsProcessed * 1000) / world.stats.tickDuration);

    // Update image
    updateImage(world);

    if (world.stats.animalsAlive > 0) window.setTimeout(function() {executeUpdate(world, runAnimals(world));}, 100);
}


// This function paints an update based on animal locations.
function updateImage(world) {

    const radius = 80;
    const origo = 500;
    var stats = world.stats;
    var locations = world.locations;
    var ctx = world.ctx;

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
        location.forEach(animal => {

            if (animal == null) return;
            // Radius r
            // Tra  nslate location l into x, y on circle r
            // 2pi / max * location = angle
            
            if (animal.genome.type > 1) {
                b += 2;
                ctx.fillStyle = "rgb(255, " + (animal.genome.type  * 32) + " , " + (animal.genome.shape * 32) + ")";
                var angle = Math.PI * animal.location * 2 / stats.worldSize;
                var x = origo + Math.cos(angle) * (radius + b);
                var y = origo + Math.sin(angle) * (radius + b);
                ctx.fillRect( x, y, 1, 1 );
            }
            else {
                o += 1;
                if (o > radius) o = radius;
                ctx.fillStyle = "rgb(0, " + (animal.genome.type  * 32) + " , " + (animal.genome.shape * 32) + ")";
                var angle = Math.PI * animal.location * 2 / stats.worldSize;
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
    document.getElementById("animalsAlive").innerHTML = stats.animalsAlive;
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

    document.getElementById("imageUpdateTime").innerHTML = Date.now() - stats.imageUpdateTimeStart;
}
