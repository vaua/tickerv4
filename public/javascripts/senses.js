"use strict";

(function (exports) {

    var Sense = {};
    var senses;

    // This function will create the senses available along with all the help functions they have.
    function createSenses() {

        var senses = [];

        // Each sense will have 3 main functions:
        // - create a valid gene sequence for this sense (and also recognise and consume this?)
        // - based on the world, create impression that can be matched with trigger
        // - how to translate the action chosen (and senses will also provide all
        //   possible actions associated with the sense) into the world actions.

        senses.push(window.VisionSense.getVisionSense());
        senses.push(window.InternalSense.getInternalSense());

        return senses;
    }


    // =======================================================

    // Visual break between creating senses and help functions

    // =======================================================

    function getSenses() {
        if (senses === undefined) senses = createSenses();
        return senses;
    }

    function getTractGeneForSense(sense) {
        if (senses === undefined) senses = createSenses();
        
        // Execute the first function in the genome code.
        return senses[sense][0];
    }

    function getImpressionsForSense(sense) {
        if (senses === undefined) senses = createSenses();
        
        // Execute the second function in the genome code.
        return senses[sense][1];
    }

    function getActionsForSense(sense) {
        if (senses === undefined) senses = createSenses();
        
        // Execute the second function in the genome code.
        return senses[sense][2];
    }

    function getMutatedTractGeneForSense(sense) {
        if (senses === undefined) senses = createSenses();
        
        // Execute the first function in the genome code.
        return senses[sense][3];
    }

    Sense.getSenses = getSenses;
    Sense.getTractGeneForSense = getTractGeneForSense;
    Sense.getImpressionsForSense = getImpressionsForSense;
    Sense.getActionsForSense = getActionsForSense;
    Sense.getMutatedTractGeneForSense = getMutatedTractGeneForSense;

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        module.exports = Sense;
    } else {
        window.Sense = Sense;
    }


}) ();