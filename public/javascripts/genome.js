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

        var senses = [];

        if (senses.length == 0) {
            senses = window.Sense.getSenses();
        }

        // Create a fully random Genome
        this.tracts = [];
        //this.code = [];

        this.size = getRandomInt(animalSizeSpace);
        this.shape = getRandomInt(animalTypeSpace);
        this.type = getRandomInt(animalShapeSpace);

        this.senses = senses;

        // If genome type == 0 or 1, then it is a plant. Only internal given.
        if (this.type > 1) {
            for (var s = 0; s < senses.length; s++)  {
                this.tracts[s] = [];
                ///console.log("There are " + senses.length + " senses in the genome.");
                var numberOfTracts = getRandomInt(maxTracts);
                for (var i = 0; i < numberOfTracts; i++) {
                    //console.log("Sense is: " + senses[s][0]);
                    var tract = senses[s][0]();
                    this.tracts[s][i] = tract;
                    //console.log("Added a tract " + tract + " to genome.");
                }
            }
        } else {
            /*
            // Create the plant
            var s = 1; // Designation for internal tract
            var numberOfTracts = getRandomInt(maxTracts / 2);
            for (var i = 0; i < numberOfTracts; i++) {
                var tract = senses[s][0]();
                this.tracts[s][i] = tract;
            }
            */ // Will wait with this... right now.
        }
        //this.code.push(this.tracts);

        function getSenses() {
            return Sense.getSenses();
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
