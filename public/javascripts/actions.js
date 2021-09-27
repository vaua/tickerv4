"use strict";

(function (exports) {    
    
    var Action = {};



    function initiateWorldActions(world) {
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

            //console.log("Changing location for animal " + being.id + " with delta " + locationDelta);
            //console.log("Current animal localtion is: " + animal.location + ", in world location: " + world.locations[animal.location]);

            // Check that the animal is in the location it says it is.
            if (world.checkCorrectLocation(being)) {
                var newLocation = (being.location + locationDelta) % world_size;
                if (newLocation < 0) newLocation += world_size;
                
                // Update the location, and the animal location.
                // First, remove the animal from the location it is in.
                var beingIndex = getBeingIndex(being, world.locations[being.location]);
                world.locations[being.location].splice(beingIndex, 1);

                /*for (var l = 0; l < world.locations[being.location].length; l++) {
                    if (world.locations[being.location][l].id == being.id) {
                        console.log("Unqualified. Should have left already.");
                    }
                }*/
                
                // Then, add it to the new location.
                world.addToLocation(newLocation, being);

                //console.log("New location is: " + being.location);
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

            being.adjustEnergy(energyDelta);
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

            if (world.locations[being.location].length > max_beings_per_location) return;

            var energyGiven = Math.floor(being.energy * 0.15 * energyPercentage);

            being.energy -= energyGiven;
            var energyPerKid = Math.floor(energyGiven / numberOfKids);

            

            for (var i = 0; i < numberOfKids; i++) {
                var child = new Being(world.stats.beingsCreated++, energyPerKid, being.genome.mutate(general_mutation_severity), being.orientation);
                being.numberOfKids++;
                if (child.isAnimal()) {
                    world.stats.animalsCreated ++;
                    world.stats.animalsAlive ++;
                } else {
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

    }


    Action.initiateWorldActions = initiateWorldActions;
    


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        module.exports = Action;
    } else {
        window.Action = Action;
    }


}) ();