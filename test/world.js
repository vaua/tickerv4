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
         
       });
  });