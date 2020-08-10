(function() {

    function Animal(id, initialEnergy, genome, orientation) {
        this.id = id;
        this.energy = initialEnergy;
        this.genome = genome;
        this.orientation = orientation;
        this.affinities = [];
        this.target;

//        console.log("Affinities initated to " + this.affinities);
        for (var a = 0; a < 2; a++) {
            this.affinities[a] = [];
            for (var b = 0; b < 32; b++) {
                this.affinities[a][b] = 0;
            }
        }

        //console.log(this.affinities);


        //debug("Creating animal " + this.id);
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning animal!");
        module.exports = Animal;
    } else {
        this['animal']={};
        window.Animal = Animal;
    }
}) ();
