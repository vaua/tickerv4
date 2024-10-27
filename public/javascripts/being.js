"use strict";

(function() {

    /* Being is borh with following parameters:
        - id: The id of the being in the world. Unique.
        - Initial Energy: If child, depends on how much energy parent gives. If random... then random up to limit.
        - Genome: Structure deciding on size, type, shape and trigger/action pairs. Defines the being.
        - Orientation: Hum - funny one, given we are not sending in location... but basically, is being looking left or right.
        - Lineage: Generational number of the being. Randomly created beings have lineage 1. Their offspring 2. Theirs 3... and so on. 
    */
    function Being(id, initialEnergy, genome, orientation, lineage) {
        this.id = id;
        this.energy = initialEnergy;
        this.genome = genome;
        this.orientation = orientation;
        this.lineage = lineage + 1;

        this.maxEnergy = max_energy_coefficient * this.genome.size;  // Maximum energy that this being can have.
        this.old_energy_dropoff_threshold = old_energy_coefficient * this.genome.size; // Age limit after which max energy is dimished
        this.maxBodyEnergy = this.genome.size * bodyEnergyContent;   // Maxixum energy stored in beings body, that can be consumed after death

        // Zero out all counters.
        this.dead = false;
        this.energyDelta = 0;
        this.age = 0;
        this.numberOfKids = 0;
        this.consecutiveEnergyIncreases = 0;
        this.energyLastTick = 0;
        this.timesAttacked = 0;
        this.timesEaten = 0;
        this.bodyEnergyClaimed = 0;
        this.bodyEnergy = 0;

        // Stuff decided in the last round
        this.impressions = {};        // For each sense, all impressions from the last tick.
        this.triggeredTracts = {};    // For each senses, the tract that was triggered during last tick.
        this.lastActions = [];        // The action triggered last time.

        this.lastImpressions = []; // The impression that triggered being in the last tick
        this.lastTrigger = [];     // The trigger triggered in the last tick

        // Set up afinities for all tracts
        this.affinities = [];
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
                this.bodyEnergy += energyChange;
                

                 // Diminish max energy due to old age
                if (this.age > this.old_energy_dropoff_threshold) {
                    this.maxEnergy--;
                }

            } else {
                if (this.inHighGrowthArea()) {
                    // Changed this on 25/7 to see if there is a difference
                    this.bodyEnergy += energyHighGain;
                    this.energy += energyHighGain;

                } else {
                    this.bodyEnergy += energyGain;
                }
            }
            if (this.bodyEnergy > this.maxBodyEnergy) this.bodyEnergy = this.maxBodyEnergy;
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

        this.energyDelta = this.energy - this.energyLastTick;
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
            // Being is dead, remove all the senses, and set shape to under 128.
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
