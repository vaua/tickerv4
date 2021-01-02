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
        this.lastTrigger = [];
        this.lastActions = [];
        this.numberOfKids = 0;
        this.consecutiveEnergyIncreases = 0;
        this.energyLastTick = 0;

        for (var a = 0; a < 2; a++) {
            this.affinities[a] = [];
            for (var b = 0; b < 32; b++) {
                this.affinities[a][b] = 0;
            }
        }
    }

    Being.prototype.tick = function() {
        if (!this.isDead()) {
            // for living creatures, decrease energy based on size
            if (this.isAnimal()) {
                this.energy -= energyLoss * (this.genome.size + 1);
            } else {
                this.energy += 20;
            }
            this.age++;
        } else {
            // for dead beings, just ordinary decay...
            this.energy -= energyLoss;
        }

        // Check if more energy than before
        if (this.energy > this.energyLastTick) {
            this.consecutiveEnergyIncreases++;
        } else {
            this.consecutiveEnergyIncreases = 0;
        }

        // Chop it off to max if over max
        if (this.energy > (2 * 200 * this.genome.size)) {
            this.energy = 2 * 200 * this.genome.size;
        }

        this.energyLastTick = this.energy;
    }

    Being.prototype.isDecomposed = function() {
        return this.energy <= -(energyContent * this.genome.size * 5);
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
