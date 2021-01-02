"use strict";


(function(exports) {

    function Genome() {

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

        // Create a fully random Genome
        this.tracts = [];
        //this.code = [];

        this.size = getRandomInt(animalSizeSpace);
        this.shape = getRandomInt(animalShapeSpace);
        this.type = getRandomInt(animalTypeSpace);

        for (var sense in beingTypeToSensesMapping[this.type]) {
            this.tracts[sense] = [];

            var numberOfTracts = getRandomInt(maxTracts);
            for (var i = 0; i < numberOfTracts; i++) {
                //console.log("Sense is: " + senses[s][0]);
                var tract = Sense.getTractGeneForSense(sense)();
                this.tracts[sense][i] = tract;
                //console.log("Added a tract " + tract + " to genome.");
            }
        }
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