"use strict";


(function(exports) {

    // Consts used in triggers
    const maxTracts = 32;

    const animalSizeBits = 3;
    const animalTypeBits = 3;
    const animalShapeBits = 3;
    const sizeSpace = Math.pow(2, animalSizeBits);
    const shapeSpace = Math.pow(2, animalShapeBits);
    const typeSpace = Math.pow(2, animalTypeBits);
    
    const distanceBits = 3;
    const distanceSpace = Math.pow(2, distanceBits);
    const visibility = distanceSpace;
    
    const visionActionBits = 5;
    const affinityBits = 3;
    const visionTriggerSpace = Math.pow(2, (animalSizeBits + animalTypeBits + animalShapeBits + distanceBits));
    const visionActionSpace = Math.pow(2, visionActionBits);
    const visionAffinitySpace = Math.pow(2, affinityBits);

    const animalEnergyBits = 2;
    const animalEnergyDeltaBits = 2;
    const internalActionBits = 8;
    const internalTriggerSpace = Math.pow(2, (animalEnergyBits + animalEnergyDeltaBits));
    const internalActionSpace = Math.pow(2, internalActionBits);
    const internalAffinitySpace = visionAffinitySpace;


    const sizeMultiplier = Math.pow(2, (animalTypeBits + animalShapeBits + distanceBits));
    const shapeMultiplier = Math.pow(2, (animalShapeBits + distanceBits));
    const typeMultiplier = Math.pow(2, distanceBits);

    var senses = createSenses();

    function Genome(code, visionTractLength) {

        // Create a random Genome
        // Each creature has three main attributes: size, shape and type.
        // Size decides max energy, max speed, etc. Shape is just a token for
        // recognition, and does not have more meaning other then being inherited by
        // offspring.

        // Beyond these attributes, each animal may have senses. Plants have no senses.
        // All other animals will have two senses, vision and internal.

        // Each sense will have a number of tracts (trigger-action couples). sense
        // will provide a trigger in each turn that is matched with the trigger pattern,
        // and if match is successful, then corresponding action is executed.
        // This is the main motor of the simulation.

        // var senses = [];

        // if (senses.length == 0) {
        //     senses = createSenses();
        // }

        if (code === undefined) {

            this.code = [];

            // Create a fully random Genome
            this.tracts = [];
            //this.code = [];

            this.size = getRandomInt(sizeSpace);
            this.code[0] = this.size;

            this.shape = getRandomInt(shapeSpace);
            this.code[0] += this.shape * sizeSpace;

            this.type = getRandomInt(typeSpace);
            this.code[0] += this.type * sizeSpace * shapeSpace;

            // If genome type == 0 or 1, then it is a plant. No senses should be given.
            if (this.type > 1) {
                for (var s = 0; s < senses.length; s++)  {
                    this.tracts[s] = [];
                    ///console.log("There are " + senses.length + " senses in the genome.");
                    var numberOfTracts = getRandomInt(maxTracts);
                    for (var i = 0; i < numberOfTracts; i++) {
                        //console.log("Sense is: " + senses[s][0]);
                        var tract = senses[s][0]();
                        this.tracts[s][i] = tract;
                        this.code[1 + i + (s * this.tracts[0].length)] = tract.code;
                        //console.log("Added a tract " + tract + " to genome.");
                    }
                }
            }
            //this.code.push(this.tracts);
        } else {
            // there is a code - let's construct the gene from it!
            this.code = code;
            this.size = code[0] % sizeSpace;

            this.shape = Math.floor((code[0] % (sizeSpace * shapeSpace)) / sizeSpace);
            this.type = Math.floor((code[0] % (sizeSpace * shapeSpace * typeSpace)) / (sizeSpace * shapeSpace));

            this.tracts = [];
            
            this.tracts[0] = [];
            this.tracts[1] = [];
            for (var s = 0; s < code.length - 1; s++) {
                var tractCode = code[s + 1];
                if (s < visionTractLength) {
                    this.tracts[0][s] = senses[0][3](tractCode);
                } else {
                    this.tracts[1][s - visionTractLength] = senses[1][3](tractCode);
                }
            }

        }

        Genome.prototype.getSenses = function() {
            return senses;
        }
    }

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

        // Expecing genome: (none right now, but eventually they can be sent in instead of stated below.)
        var createVisionTractGene = function (params) {

            // No params used right now, might be used in the future.
            var tract = {};

            //tract.sense = vision;
            // Trigger for vision shall consist of four parts: size, shape, type and distance (for now)
            // Lets assume 8 bits for each? But, it means it will be extremely difficult to match, so no good.
            // Must be less, in order to match.
            
            tract.trigger = getRandomInt(visionTriggerSpace);
            tract.code = tract.trigger;

            // Visual sense can lead to two actions, move or eat/attach. Move requires also parameter (forward / backward, and how much)
            // All this fits in range of 32 (2 pow 5). The function that will be translating the action to world action will know how to interpret:
            // 0-15: move, 0 most back, 15 most forward. 16-31: eat.
            tract.action = getRandomInt(visionActionSpace);
            tract.code += tract.action * visionTriggerSpace;

            // Denotes the affinity animal has for this action. This can be changed during the animals life.
            tract.affinity = getRandomInt(visionAffinitySpace);
            tract.code += tract.affinity * visionTriggerSpace * visionActionSpace;

            return tract;
        }

        // get tractFromTractCode, when recreating genome from code
        var getVisionTractFromCode = function (params) {
    
            var tract = {}
            var code = params;

            tract.trigger = code % visionTriggerSpace;
            tract.action = Math.floor(code / visionTriggerSpace) % visionActionSpace;
            tract.affinity = Math.floor(code / (visionTriggerSpace * visionActionSpace));
            
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

            // For each object I as animal can see, check if it hits any triggers
            visible_objects.forEach(obj => {

                if (obj.genome !== undefined) {
                    if (obj !== animal) {
                        if (obj === undefined) {
                            console.log("Hm, weird. Why is an object undefined?");
                        }

                        // calculate the impression number of object.
                        var sizeComp = obj.genome.size * sizeMultiplier;
                        var shapeComp = obj.genome.shape * shapeMultiplier;
                        var typeComp = obj.genome.type * typeMultiplier;
                        var distanceComp = Math.abs(obj.location - animal.location);
                        var impressionNumber =  sizeComp + shapeComp + typeComp + distanceComp;

                        impressions.push([impressionNumber, obj]);
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
                return [0, [animal.id, distance]];
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
                    return [[1, [animal.id, energyUtilised]], [1, [presumptiveFood.id, -energyUtilised]]];
                } else {
                    // Animal alive, we are fighting!
                    // The damage made by the attacking animal will be dependant on the
                    // sizeDifference and energy difference between the animal.
                    // Small animal with low energy will make least impact. Big animal with
                    // lots of energy will make the most impact.


                    // This is ok for now, will add energy impact later.
                    var damage = Math.pow(2, animalSizeBits) + animal.genome.size - presumptiveFood.genome.size;
                    return [1, [presumptiveFood.id, -damage]];
                }
            }
        }








        // Must all sense functions take same params? Most likely no.
        // How mamy action bits?

        // vilken actions, viken tract, vilken förändring, hur många barn, hur mycket energy till barnen.
        // Förslag: 8 bitar (0-255)
        // 0-127: affinityAdjustment. Upp till 32 tracts. 0-31: strongly lower. 32-63: little lower. 64-95: little more. 96-127: much more!
        // 128-256: give birth. 2 bitar - hur mycket energy, 5 bitar hur mycket barn (max 15 då). 128-159: 15% energi. 160-191: 30% energi. 192-223: 45% energi 224-255: 60%.

        var createInternalTractGene = function (params) {

            // No params used right now, might be used in the future.
            var tract = {};

            //tract.sense = internal;

            // Trigger for vision shall consist of two parts: Internal energy and energyDelta during the last cycle.
            // Lets assume 2 bits for each? Energy: very low, low, good, high. Delta: very negative, negative, positive, very positive.
            // Zero is positive :)
            
            tract.trigger = getRandomInt(internalTriggerSpace);
            tract.code = tract.trigger;

            // Internal sense can lead to two actions: adjust action affinity and give birth. Adjust action will give argument what action,
            // how much (little or much) and what direction. Give birth takes one argument - how many kids.
            tract.action = getRandomInt(internalActionSpace);
            tract.code += tract.action * internalTriggerSpace;

            // Denotes the affinity animal has for this action. This can be changed during the animals life.
            tract.affinity = getRandomInt(internalAffinitySpace);
            tract.code += tract.affinity * internalTriggerSpace * internalActionSpace;

            return tract;
        }

        // get tractFromTractCode, when recreating genome from code
        var getInternalTractFromCode = function (params) {

            var tract = {}
            var code = params;

            tract.trigger = code % internalTriggerSpace;
            tract.action = Math.floor(code / internalTriggerSpace) % internalActionSpace;
            tract.affinity = Math.floor(code / (internalTriggerSpace * internalActionSpace));
            
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

            if (action < Math.pow(2, (internalActionBits - 1)) + 80) {
                // The action is to adjust affinity

                var tractToAdjust = action % 32;
                var senseToAdjust = tractToAdjust % 2;
                var tractInSenseToAdjust = Math.floor(tractToAdjust / animal.genome.tracts[senseToAdjust].length);

                // calculate amount -3, -1, 1, 3.
                var adjustment = Math.floor(action / 32) * 2 - 3;

                return [2, [animal.id, senseToAdjust, tractInSenseToAdjust, adjustment]];
            } else {
                // the action is to give birth!

                // First remove half, as it is the lower action half (affinity adjustment)
                action = action - Math.pow(2, (internalActionBits - 1));


                var numberOfKids = Math.ceil(action / 32);
                var energyAmount = (action % 4) + 1;
                return [3, [animal.id, numberOfKids, energyAmount]];
            }
        }


        // The sense is defined by its three actions:
        // 0 - create sense tract gene
        // 1 - express world into animal's rhealm
        // 2 - express animal's action into world's rhealm
        // 3 - getTractFromCode
        vision.push(createVisionTractGene, createVisionImpressionsFromWorld, translateVisionActionToWorldAction, getVisionTractFromCode);
        internal.push(createInternalTractGene, createInternalImpressionsFromWorld, translateInternalActionToWorldAction, getInternalTractFromCode);

        s.push(vision, internal);

        return s;
    }


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning Genome!");
        module.exports = Genome;
    } else {
        //this['Genome']={};
        window.Genome = Genome;
    }
    }
) ();

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
