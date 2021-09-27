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
        this.maxEnergy = max_energy_coefficient * this.genome.size;
        this.initialMaxEnergy = this.maxEnergy;
        this.old_energy_dropoff_threshold = old_energy_coefficient * this.genome.size;
        this.timesAttacked = 0;
        this.timesEaten = 0;
        this.bodyEnergyClaimed = 0;
        this.bodyEnergy = 0;
        this.maxBodyEnergy = this.genome.size * energyContent;


        // Set up afinities for all tracts
        this.getSensesArray().forEach(sense => {
            this.affinities[sense] = [];
            for (var i = 0; i < this.genome.tracts[sense].length; i++) {
                // Initiating all affinities to 0, tabula rasa
                this.affinities[sense][i] = 0;
            }
        });
    }

    Being.prototype.tick = function() {
        if (!this.isDead()) {
            // for living creatures, decrease energy based on size
            if (this.isAnimal()) {
                var energyChange = energyLoss * (this.genome.size + 1);
                this.energy -= energyChange;
                if (this.bodyEnergy < this.maxBodyEnergy) this.bodyEnergy += energyChange;
                if (this.bodyEnergy > this.maxBodyEnergy) this.bodyEnergy = this.maxBodyEnergy;

                 // Diminish max energy due to old age
                if (this.age > this.old_energy_dropoff_threshold) {
                    this.maxEnergy--;
                }

            } else {
                if (this.inHighGrowthArea()) {
                    this.bodyEnergy += 30;
                } else {
                    this.bodyEnergy += 9;
                }
            }
            this.age++;
        } else {
            // for dead beings, just ordinary decay...
            this.bodyEnergy -= energyLoss;
        }

        // Check if more energy than before
        if (this.energy > this.energyLastTick) {
            this.consecutiveEnergyIncreases++;
        } else {
            this.consecutiveEnergyIncreases = 0;
        }

       

        // Chop it off to max if over max
        if (this.energy > this.maxEnergy) {
            this.energy = this.maxEnergy;
        }

        this.energyLastTick = this.energy;
    }

    Being.prototype.isDecomposed = function() {
        return this.bodyEnergy < 0;
    }

    Being.prototype.energyLeftToBeClaimed = function() {
        return this.bodyEnergy - this.bodyEnergyClaimed;
    }

    Being.prototype.isAnimal = function() {
        return this.genome.type > 1;
    }

    Being.prototype.isDead = function() {
        return this.dead;
    }

    Being.prototype.hasSenses = function() {
        return this.genome.tracts.length > 0;
    }

    Being.prototype.getNumberOfSenses = function() {
        return this.genome.tracts.length;
    }

    Being.prototype.adjustEnergy = function(delta) {
        if (this.isDead()) {
            this.bodyEnergy += delta;
        } else {
            this.energy += delta;
        }
    }

    Being.prototype.getNumberOfTracts = function() {
        var numberOfTracts = 0;
        
        this.genome.tracts.forEach(sense => {
            var indexOfSense = this.genome.tracts.indexOf(sense);
            numberOfTracts += this.genome.tracts[indexOfSense].length;
        });
        
        return numberOfTracts;
    }

    Being.prototype.checkForDeath = function() {
        if (this.energy <= 0 && !this.isDead()) {
            this.genome.tracts = [];
            this.genome.shape -= animalShapeSpace / 2;
            this.dead = true;
            return true;
        } 

        return false;
    }

    Being.prototype.getSenseTracts = function(sense) {
        return this.genome.tracts[sense];
    }

    Being.prototype.getSensesArray = function() {
        return beingTypeToSensesMapping[this.genome.type];
    }

    Being.prototype.getSenseNameFromSenseIndex = function(senseIndex) {
        return this.getSensesArray[senseIndex];
    }

    Being.prototype.inHighGrowthArea = function() {
        return high_growth_areas.some(area_start => this.location > area_start && this.location < (area_start + high_growth_areas_size));
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        console.log("Returning the being!");
        module.exports = Being;
    } else {
        window.Being = Being;
    }
}) ();
