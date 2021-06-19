//var expect = require("chai").expect;
//var world  = require("../public/javascripts/world.js");
//var Genome  = require("../public/javascripts/genome.js");
//var params = require("../public/javascripts/constants.js")

describe("World", function() {
    // specification code
    

    describe("Create one random animal and add it to the world", function() {
    
        
            // specification for Create one random animal and add it to the world
        it("Creates one random animal", function() {
            var w1 = new World();    
            chai.expect(w1.stats.beingsAlive).to.equal(0);
            w1.createNewRandomAnimal();
            chai.expect(w1.stats.beingsAlive).to.equal(1);

            
        });

        it ("Creates 1000 random animals", function() {
            var w1 = new World();
            for (var i = 0; i < 1000; i++) {
                w1.createNewRandomAnimal();
            }
            chai.expect(w1.stats.beingsAlive).to.equal(1000);
        });

        it ("Creates 1000 random animals and run it for 1 cycle", function() {
            var w1 = new World();
            for (var i = 0; i < 1000; i++) {
                w1.createNewRandomAnimal();
            }
            chai.expect(w1.stats.beingsAlive).to.equal(1000);

            for (var i = 0; i < 1; i++) {
                w1.tick(w1.presentWorldAndGetActions());
            }

            chai.expect(w1.stats.beingsAlive).to.lessThanOrEqual(1000);
        });

        it("Creates one specific animal and run it for several ticks", function() {
            var w1 = new World();    
            chai.expect(w1.stats.beingsAlive).to.equal(0);

            // Create a specific animal, that will move to the right if there is an specific animal to its left
            var genome = new Genome(true);
            genome.size = 1;
            genome.shape = 5;
            genome.type = 4;
            genome.tracts = [];
            genome.tracts[0] = [];
            genome.tracts[1] = [];

            //Create tracts for one sense - vision
            var reactToOne =  {};
          
            // Level 1 triggers on 1. Will trigger action 1 with affinity 5.
            reactToOne.trigger = [1, 0, 0];
            reactToOne.action = 0;
            reactToOne.affinity = 5;
            

            genome.tracts[0].push(reactToOne);

            var animal = new Being(0, 100, genome, 0);
            w1.createSpecificBeing(0, animal);
            
            
            chai.expect(w1.stats.beingsAlive).to.equal(1);



            
        });

         
       });
  });