"use strict";

(function (exports) {

    var InternalSense = {};

    var getInternalSense = function() {
        var internal = [];

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

            // Internal sense can lead to two actions: adjust action affinity and give birth. Adjust action will give argument what action,
            // how much (little or much) and what direction. Give birth takes one argument - how many kids.
            tract.action = getRandomInt(internalActionSpace);

            // Denotes the affinity animal has for this action. This can be changed during the animals life.
            tract.affinity = getRandomInt(Math.pow(2, affinityBits));

            return tract;
        }


        // and now internal sense? should be easier then vision :)
        // We will be given three parameters, but will ignore locations and batch.
        var createInternalImpressionsFromWorld = function(params) {

            if (params.length != 2) {
                console.log("Wrong amount of params given to createInternalImpressionsFromWorld function!");
                return;
            }

            var being = params[1];

            var impressions = [];
            var energyStatus;
            var energyDelta;

            // What is max energy for being type?
            // Under 15% => 0, 15-50% =>1, 50-85% = 2, 85-100% = 3;
            var fifteenPercent = Math.floor(being.initialMaxEnergy  * 0.15);
            if (being.energy > being.initialMaxEnergy - fifteenPercent) {
                energyStatus = 3;
            } else if (being.energy > being.initialMaxEnergy / 2) {
                energyStatus = 2;
            } else if (being.energy > being.initialMaxEnergy) {
                energyStatus = 1;
            } else {
                energyStatus = 0;
            }

            if (being.energyDelta < being.initialMaxEnergy * -0.05) {
                energyDelta = 0;
            } else if (being.energyDelta < 0) {
                energyDelta = 1;
            } else if (being.energyDelta < being.initialMaxEnergy * 0.05) {
                energyDelta = 2;
            } else {
                energyDelta = 3;
            }

            impressions.push([energyStatus * 4 + energyDelta, being]);
            return impressions;
        }

        var translateInternalActionToWorldAction = function(params) {

            if (params.length < 2) {
                console.log("Wrong amount of params given to translateVisionActionToWorldAction function!");
                return;
            };

            var being = params[0];
            var action = params[1];

            if (action < birthTractThreshold) {
                // The action is to adjust affinity

                var tractToAdjust = action % being.getNumberOfTracts();
                var senseToAdjust;
                var tractInSenseToAjdust;

                being.getSensesArray().some(function(indexOfSense) {
                    var senseTracts = being.getSenseTracts(indexOfSense);
                    if (tractToAdjust < senseTracts.length) {
                        senseToAdjust = indexOfSense;
                        return true;
                    }
                    tractToAdjust -= senseTracts.length;
                    return false;
                });

                // calculate amount -3, -1, 1, 3.
                var adjustment = Math.floor(action / 32) * 2 - 3;

                return [2, [being, senseToAdjust, tractToAdjust, adjustment]];
            } else {
                // the action is to give birth!

                // First remove half, as it is the lower action half (affinity adjustment)
                action = action - birthTractThreshold;


                var numberOfKids = Math.ceil(action / 32);
                var energyAmount = (action % 4) + 1;
                return [3, [being, numberOfKids, energyAmount]];
            }
        }

        // The sense is defined by its three actions:
        // 0 - create sense tract gene
        // 1 - express world into being's rhealm
        // 2 - express being's action into world's rhealm
        internal.push(createInternalTractGene, createInternalImpressionsFromWorld, translateInternalActionToWorldAction);
        return internal;   
    }

    InternalSense.getInternalSense = getInternalSense;

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        module.exports = InternalSense;
    } else {
        window.InternalSense = InternalSense;
    }
}) ();