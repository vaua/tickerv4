"use strict";

(function() {

    var energyLoss = 1;
    var energyContent = 5;
    var plantEnergyGain = 1;

    function Being(id, initialEnergy, genome, orientation) {
        this.id = id;
        this.initialEnergy = initialEnergy;
        this.energy = initialEnergy;
        this.genome = genome;
        this.orientation = orientation;
        this.affinities = [];
        this.dead = false;
        this.age = 0;
        this.lastImpressions = [];
        this.lastActions = [];

        for (var a = 0; a < 2; a++) {
            this.affinities[a] = [];
            for (var b = 0; b < 32; b++) {
                this.affinities[a][b] = 0;
            }
        }
    }

    Being.prototype.tick = function() {
        if (!this.isDead()) {
            // for living creatures, increase energy based on size
            this.energy -= energyLoss * (this.genome.size + 1);
            this.age++;
        } else {
            // for dead beings, just ordinary decay...
            this.energy -= energyLoss;
        }
    }

    Being.prototype.isDecomposed = function() {
        return this.energy <= -(energyContent * this.genome.size);
    }

    Being.prototype.isAnimal = function() {
        return this.genome.type > 1;
    }

    Being.prototype.isDead = function() {
        return this.dead;
    }

    Being.prototype.checkForDeath = function() {
        if (this.energy <= 0 && !this.isDead()) {
            this.genome.tracts = [];
            this.dead = true;
            return true;
        } 

        return false;
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning the being!");
        module.exports = Being;
    } else {
        window.Being = Being;
    }
}) ();
