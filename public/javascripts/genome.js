"use strict";

(function(exports) {

    function Genome(empty) {

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

        if (empty !== undefined && empty == true) return this;

        this.tracts = [];

        this.size = getRandomInt(animalSizeSpace);
        this.shape = getRandomInt(animalShapeSpace / 2) + (animalShapeSpace / 2);
        this.type = getRandomInt(animalTypeSpace);

        // For each sense that this type of animal has
        beingTypeToSensesMapping[this.type].forEach(sense => {
            
            this.tracts[sense] = [];

            var numberOfTracts = getRandomInt(maxTracts[sense]);
            for (var i = 0; i < numberOfTracts; i++) {
                var tract = Sense.getTractGeneForSense(sense)();
                this.tracts[sense][i] = tract;
            }
        });
    }

    Genome.prototype.mutate = function (severity) {
        /* How shall we think here?
        It's obvious that tracts should change. 
        Maybe it's best if every sense tell us how to mutate it's own gene... 
        like, insted of giving us a new random tract, it gives us a "modified" tract every time we ask.
        That should do it pal!
        */

        var mutated = new Genome(true);

        mutated.size = this.size;
        mutated.shape = this.shape;
        mutated.type = this.type;
        mutated.tracts = [];

        beingTypeToSensesMapping[this.type].forEach(sense => {
            
            mutated.tracts[sense] = [];
            
            this.tracts[sense].forEach(tract => {
                mutated.tracts[sense].push(Sense.getMutatedTractGeneForSense(sense)([tract, severity]));
            });
        });

        return mutated;
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