(function() {

    function Animal(id, initialEnergy, genome, orientation) {
        this.id = id;
        this.energy = initialEnergy;
        this.genome = genome;
        this.orientation = orientation;
        this.affinities = [];

//        console.log("Affinities initated to " + this.affinities);
        for (var a = 0; a < 2; a++) {
            this.affinities[a] = [];
            for (var b = 0; b < 32; b++) {
                this.affinities[a][b] = 0;
            }
        }
    }

    Animal.prototype.getShortForm = function () {
        // First encode 32 3 bit affinity numbers per sense (64 * 3 = )
        var animalNumber = [];

        animalNumber[0] = encodeArray(this.affinities[0].slice(0,15), 3);
        animalNumber[1] = encodeArray(this.affinities[0].slice(16,31), 3);
        animalNumber[2] = encodeArray(this.affinities[1].slice(0,15), 3);
        animalNumber[3] = encodeArray(this.affinities[1].slice(16,31).concat([this.orientation]), 3);
        animalNumber[4] = this.genome.code;
    
        return animalNumber;
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning animal!");
        module.exports = Animal;
    } else {
        this['animal']={};
        window.Animal = Animal;
    }

    function encodeArray(numbers, sizeInBytes) {
        var result = 0;

        if (numbers.length * sizeInBytes > 52) console.log("ERRRRRORRRR");

        for (var i = 0; i < numbers.length; i++) {
            result += numbers[i] * Math.pow(2, i * sizeInBytes);
        }
    
        return result;
    }
}) ();
