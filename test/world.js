//var expect = require("chai").expect;
//var world  = require("../public/javascripts/world.js");
//var Genome  = require("../public/javascripts/genome.js");
//var params = require("../public/javascripts/constants.js")

describe("World", function() {
    // specification code
    describe("Create one random animal and add it to the world", function() {
        // specification for Create one random animal and add it to the world
        it("Creates one random animal", function() {
            w1 = new World();
            chai.expect(w1.stats.beingsAlive).to.equal(0);
            
            w1.createNewRandomAnimal();

            chai.expect(w1.stats.beingsAlive).to.equal(1);
        });
         
       });
  });