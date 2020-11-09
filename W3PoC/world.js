var world;
var debug = require('debug')('world');
var Animal = require('../public/javascripts/animal.js')
var Genome = require('../public/javascripts/genome.js')

const world_size = 5000;
const init_animals = 5000;
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

    debug("Starting world.");

    // Setup world
    setupWorld(this);

    // create Initial creatures
    this.createInitialCreatures();

    world = this;
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
        console.log("Current animal localtion is: " + animal.location + ", in world location: " + world.locations[animal.location]);

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
        debug("Changing energy " + energyDelta + " for animal " + animal.id);

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

        debug("Changing affinity for animal " + animal.id + ", " + sense + ", " + tract + ", " + delta);
        // Adjust the affinities
        //console.log(animal.affinities);
        animal.affinities[sense][tract] += delta;
        //console.log("Done changing.");
        world.stats.affinityChanged++;
    }

    var giveBirth = function (params) {
        if (params.length != 3) {
            console.log("Wrong amount of params given to giveBirth action!");
            return;
        }

        // At this point, we are just duplicating. Mutations will be added Later
        //var world = params[0];
        var animal = params[0];
        var numberOfKids = params[1];
        var energyPercentage = params[2];

        var energyGiven = Math.floor(animal.energy * 0.15 * energyPercentage);

        animal.energy -= energyGiven;
        energyPerKid = Math.floor(energyGiven / numberOfKids);

        debug("Giving birth to " + numberOfKids + " kids!");

        for (i = 0; i < numberOfKids; i++) {
            var child = new Animal(world.stats.animalsCreated, energyPerKid, animal.genome, animal.orientation);
            world.stats.animalsCreated += 1;
            world.addToLocation(animal.location, child);
        }

        world.stats.birthsGiven += numberOfKids;
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
    }
}

World.prototype.createNewRandomAnimal = function () {
    //console.log("New random animal.");
    var genome = new Genome();
    var init_energy = getRandomInt(energy_norm) * genome.size
    animal = new Animal(this.stats.animalsCreated++, init_energy, genome, this.stats.animalsCreated % 2);
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

module.exports = World;
