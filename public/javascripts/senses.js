"use strict";

(function (exports) {

    var Sense = {};
    var senses;

    // This function will create the senses available along with all the help functions they have.
    function createSenses() {

        //console.log("Creating senses.");
        var s = [];

        // Each sense will have 3 main functions:
        // - create a valid gene sequence for this sense (and also recognise and consume this?)
        // - based on the world, create impression that can be matched with trigger
        // - how to translate the action chosen (and senses will also provide all
        //   possible actions associated with the sense) into the world actions.

        var vision = [];
        var internal = [];



        const visibility = distanceSpace;


        // Expecing genome: (none right now, but eventually they can be sent in instead of stated below.)
        var createVisionTractGene = function (params) {

            // No params used right now, might be used in the future.
            var tract = {};

            //tract.sense = vision;
            // Trigger for vision shall consist of four parts: size, shape, type and distance (for now)
            // Lets assume 8 bits for each? But, it means it will be extremely difficult to match, so no good.
            // Must be less, in order to match.

            // Trigger shall consist  of 1-3 levels.
            var lvls = getRandomInt(3);
            
            var lvl1 = getRandomInt(16);
            var lvl2 = 0;
            var lvl3 = 0;

            if (lvls == 1) {
                var lvl2 = getRandomInt(16);
            }

            if (lvls == 2) {
                var lvl2 = getRandomInt(16);
                var lvl3 = getRandomInt(16);
            }
            
            tract.trigger = [lvl1, lvl2, lvl3];

            // Visual sense can lead to two actions, move or eat/attach. Move requires also parameter (forward / backward, and how much)
            // All this fits in range of 32 (2 pow 5). The function that will be translating the action to world action will know how to interpret:
            // 0-15: move, 0 most back, 15 most forward. 16-31: eat.
            tract.action = getRandomInt(Math.pow(2, visionActionBits));

            // Denotes the affinity animal has for this action. This can be changed during the animals life.
            tract.affinity = getRandomInt(Math.pow(2, affinityBits));

            return tract;
        }



        // Expecting params: locations, animal. Now - the object animals id is known, but if we don't send the full batch, we
        // will not be able to fetch it. Answer - sent the full batch as parameter.
        // Will return a list of numbers representing the seen stuff that can be matched against the triggers.
        var createVisionImpressionsFromWorld = function(params) {

            if (params.length != 2) {
                console.log("Wrong amount of params given to createImpressionsFromWorld function!");
                return;
            }

            var locations = params[0];
            var animal = params[1];

            var impressions = [];

            // Figure out what animal can see
            //console.log("Creating impressions from the world.");
            var visible_objects = [];
            if (animal.orientation == 0) {  // animal is facing "left"
                visible_objects = locations.slice(animal.location - visibility, animal.location);
                visible_objects = visible_objects.flat();
                visible_objects = visible_objects.filter(function (el) {
                        return el != null;
                });
            } else {
                visible_objects = locations.slice(animal.location,
                    animal.location + visibility).flat().filter(function (el) {
                        return el != null;
                    });
            }
            //console.log("Currently seing: " + visible_objects);

            visible_objects.forEach(obj => {

                if (obj.genome !== undefined) {
                    if (obj !== animal) {
                        if (obj === undefined) {
                            console.log("Hm, weird. Why is an object undefined?");
                        }

                        // calculate the impression number of object.
                        /*
                        var sizeComp = obj.genome.size * Math.pow(2, (animalTypeBits + animalShapeBits + distanceBits));
                        var shapeComp = obj.genome.shape * Math.pow(2, (animalShapeBits + distanceBits));
                        var typeComp = obj.genome.type * Math.pow(2, distanceBits);
                        var distanceComp = Math.abs(obj.location - animal.location);
                        var impressionNumber =  sizeComp + shapeComp + typeComp + distanceComp;
                        */

                        // Alternative calculation of impression in different "granulatities"
                        var sizeComp1 = obj.genome.size >= 4;
                        var sizeComp2 = obj.genome.size - (sizeComp1 * 4) >= 2;
                        var sizeComp3 = obj.genome.size - (sizeComp1 * 4) - (sizeComp2 * 2) >= 1;

                        var typeComp1 = obj.genome.type >= 4;
                        var typeComp2 = obj.genome.type - (typeComp1 * 4) >= 2;
                        var typeComp3 = obj.genome.type - (typeComp1 * 4) - (typeComp2 * 2) >= 1;

                        var shapeComp1 = obj.genome.shape >= 4;
                        var shapeComp2 = obj.genome.shape - (shapeComp1 * 4) >= 2;
                        var shapeComp3 = obj.genome.shape - (shapeComp1 * 4) - (shapeComp2 * 2) >= 1;
                        
                        var distanceComp = Math.abs(obj.location - animal.location);
                        var distanceComp1 = distanceComp < 4;
                        var distanceComp2 = distanceComp - (distanceComp1 * 4) < 2;
                        var distanceComp3 = distanceComp - (distanceComp1 * 4) - (distanceComp2 * 2) < 1;

                        var lvl1 = (sizeComp1 * 8) + (typeComp1 * 4) + (shapeComp1 * 2) + distanceComp1;
                        var lvl2 = (sizeComp2 * 8) + (typeComp2 * 4) + (shapeComp2 * 2) + distanceComp2;
                        var lvl3 = (sizeComp3 * 8) + (typeComp3 * 4) + (shapeComp3 * 2) + distanceComp3;

                        impressions.push([[lvl1, lvl2, lvl3], obj]);
                    } else {
                        //console.log("Uuups, this is me :)");
                    }
                } else {
                    console.log("This object had no penis.");
                }
            });

            return impressions;
        }

        // This function shall translate the actions from vision tracts to world actions
        // The params are locations, animal, action, and possibly another animal (object) for example if something is being eaten.
        var translateVisionActionToWorldAction = function(params) {

            if (params.length < 2) {
                console.log("Wrong amount of params given to translateVisionActionToWorldAction function!");
                return;
            };

            var animal = params[0];
            var action = params[1];

            if (action < Math.pow(2, (visionActionBits - 1))) {
                // We are moving. No more params needed.
                // Calculate the moving distance and direction.

                var distance = action - Math.pow(2, (visionActionBits - 2));
                distance = distance * Math.floor(animal.genome.size / 2);

                // Adjust for orientation - if it is 0 (left), then turn sign.
                if (animal.orientation == 0) {
                    distance *= -1;
                }

                // New location = current + distance
                //var newLocation = animal.location + distance;

                // Returning world action 0 (move) and three parameters.
                return [0, [animal, distance]];
            } else {

                // The animal is attempting to eat. There should be one more parameter.
                if (params.length != 3) {
                    console.log("Wrong amount of params given to translateVisionActionToWorldAction function!");
                    return;
                }

                var presumptiveFood = params[2][0];

                // Identify the food.


                // If presumptive food is dead, then consume it. The type will indicate the change of energy.
                // If presumptive food is alive, you have attacked it. Calculate the energy reduction for it.

                // Food are "animals" as well, with specific type and energy (and shape).
                // Initially, they will grow every cycle. But when eaten, they will dissapear.

                // Animals that are killed must "look" different than animals that are alive.
                // Shall their type be set to a low number (and plants are already a low number to begin with?)

                // Idea - lower half of type are plants / dead aninals. Higer half are alive
                // animals. when animals eat, their energy intake is proportional to how close food type
                // is to type-1/2 type span of animal.
                // Wait, no good. Like this - alive plant eater gets most out of eating plants.
                // It gets almost nothing from eating dead animals or attacking alive ones.
                // Carnivores get almost nothing out of eating plants. But they should get good
                // energy out of eating dead herbivores.

                // So, this is the formula: when alive, animals are in the higher half of the type.
                // Third quadrant are herbivours, which go over to carnivours. Lower half -
                // First quadrant are plants, second are dead animals.
                // Eating: energi = abs(myType - foodType - 2^(typeBits-1)
                // Dying: type = type / 2 - 2^(typeBits-1)

                // Just det - huvuddistinktionen mellan animals and plants is that plants
                // do not have vision or internal senses, and their ticking will go very fast.
                // Also, they will be given energy in every turn. Now, initially, they will not
                // be multiplying, but that can change later...


                // Check if the food is alive
                if (presumptiveFood.genome.type < Math.pow(2, animalTypeBits-1)) {
                    // Dead animal or food, to be consumed
                    var energyUtilised = (animal.genome.size * 4) - Math.abs(animal.genome.type - presumptiveFood.genome.type - Math.pow(2, animalTypeBits-1));

                    // Question - should energy be adjusted different depending on the size of the animal? Probably!

                    // return world action that will add energy to animal and remove it from energyUtilised
                    return [[1, [animal, energyUtilised]], [1, [presumptiveFood, -energyUtilised]]];
                } else {
                    // Animal alive, we are fighting!
                    // The damage made by the attacking animal will be dependant on the
                    // sizeDifference and energy difference between the animal.
                    // Small animal with low energy will make least impact. Big animal with
                    // lots of energy will make the most impact.


                    // This is ok for now, will add energy impact later.
                    var damage = Math.pow(2, animalSizeBits) + animal.genome.size - presumptiveFood.genome.size;
                    return [1, [presumptiveFood, -damage]];
                }
            }
        }






        // Must all sense functions take same params? Most likely no.
        // How mamy action bits?

        const animalEnergyBits = 2;
        const animalEnergyDeltaBits = 2;
        // vilken actions, viken tract, vilken förändring, hur många barn, hur mycket energy till barnen.
        // Förslag: 8 bitar (0-255)
        // 0-127: affinityAdjustment. Upp till 32 tracts. 0-31: strongly lower. 32-63: little lower. 64-95: little more. 96-127: much more!
        // 128-256: give birth. 2 bitar - hur mycket energy, 5 bitar hur mycket barn (max 15 då). 128-159: 15% energi. 160-191: 30% energi. 192-223: 45% energi 224-255: 60%.
        const internalActionBits = 8;

        var createInternalTractGene = function (params) {

            // No params used right now, might be used in the future.
            var tract = {};

            //tract.sense = internal;

            // Trigger for vision shall consist of two parts: Internal energy and energyDelta during the last cycle.
            // Lets assume 2 bits for each? Energy: very low, low, good, high. Delta: very negative, negative, positive, very positive.
            // Zero is positive :)

            tract.trigger = getRandomInt(Math.pow(2, (animalEnergyBits + animalEnergyDeltaBits)));

            // Internal sense can lead to two actions: adjust action affinity and give birth. Adjust action will give argument what action,
            // how much (little or much) and what direction. Give birth takes one argument - how many kids.
            tract.action = getRandomInt(Math.pow(2, internalActionBits));

            // Denotes the affinity animal has for this action. This can be changed during the animals life.
            tract.affinity = getRandomInt(Math.pow(2, affinityBits));

            return tract;
        }


        // and now internal sense? should be easier then vision :)
        // We will be given three parameters, but will ignore locations and batch.
        var createInternalImpressionsFromWorld = function(params) {

            // Expecting only animal.
            if (params.length != 2) {
                console.log("Wrong amount of params given to createInternalImpressionsFromWorld function!");
                return;
            }

            var animal = params[1];

            var impressions = [];
            var energyStatus;
            var energyDelta;

            // What is max energy for animal type?
            // Under 15% => 0, 15-50% =>1, 50-85% = 2, 85-100% = 3;
            var fifteenPercent = Math.floor(animal.energyMax * 0.15);
            if (animal.energy > animal.energyMax - fifteenPercent) {
                energyStatus = 3;
            } else if (animal.energy > animal.energyMax / 2) {
                energyStatus = 2;
            } else if (animal.energy > fifteenPercent) {
                energyStatus = 1;
            } else {
                energyStatus = 0;
            }

            if (animal.energyDelta < animal.energyMax * -0.1) {
                energyDelta = 0;
            } else if (animal.energyDelta < 0) {
                energyDelta = 1;
            } else if (animal.energyDelta < animal.energyMax * 0.1) {
                energyDelta = 2;
            } else {
                energyDelta = 3;
            }

            impressions.push([energyStatus * 4 + energyDelta, animal]);
            return impressions;
        }

        var translateInternalActionToWorldAction = function(params) {

            if (params.length < 2) {
                console.log("Wrong amount of params given to translateVisionActionToWorldAction function!");
                return;
            };

            var animal = params[0];
            var action = params[1];

            if (action < Math.pow(2, (internalActionBits - 1)) + 30) {
                // The action is to adjust affinity

                var tractToAdjust = action % 32;
                var senseToAdjust = tractToAdjust % 2;
                var tractInSenseToAdjust = Math.floor(tractToAdjust / animal.genome.tracts[senseToAdjust].length);

                // calculate amount -3, -1, 1, 3.
                var adjustment = Math.floor(action / 32) * 2 - 3;

                return [2, [animal, senseToAdjust, tractInSenseToAdjust, adjustment]];
            } else {
                // the action is to give birth!

                // First remove half, as it is the lower action half (affinity adjustment)
                action = action - Math.pow(2, (internalActionBits - 1));


                var numberOfKids = Math.ceil(action / 32);
                var energyAmount = (action % 4) + 1;
                return [3, [animal, numberOfKids, energyAmount]];
            }
        }


        // The sense is defined by its three actions:
        // 0 - create sense tract gene
        // 1 - express world into animal's rhealm
        // 2 - express animal's action into world's rhealm
        vision.push(createVisionTractGene, createVisionImpressionsFromWorld, translateVisionActionToWorldAction);
        internal.push(createInternalTractGene, createInternalImpressionsFromWorld, translateInternalActionToWorldAction);

        //console.log("Vision sense: " + vision);
        //console.log("Internal sense: " + internal);

        s.push(vision, internal);
        // TODO: temporary changed to include only vision!
        //s.push(vision);

        //console.log("Created senses, vision and internal.: " + senses[0]);
        return s;
    }

    function getSenses() {
        if (senses === undefined) senses = createSenses();
        return senses;
    }

    Sense.getSenses = getSenses;


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        module.exports = Sense;
    } else {
        window.Sense = Sense;
    }


}) ();