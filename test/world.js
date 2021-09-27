//var expect = require("chai").expect;
//var world  = require("../public/javascripts/world.js");
//var Genome  = require("../public/javascripts/genome.js");
//var params = require("../public/javascripts/constants.js")

describe("World", function() {
    // specification code
    
/*
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
*/
        it("Creates one specific animal and run it for several ticks", function() {
            var w1 = new World();    
            chai.expect(w1.stats.beingsAlive).to.equal(0);

            // Create a specific animal, that will move to the right if there is an specific animal to its left
            // Animal 1 has size 2, will be burning 3 energy per turn (size + 1)

            console.log("Creating first animal.")
            var a0g = new Genome(true);
            a0g.size = 2;
            a0g.shape = 5;
            a0g.type = 4;
            a0g.tracts = [];
            a0g.tracts[0] = [];
            a0g.tracts[1] = [];

            //Create tracts for one sense - vision
            var a0t1 =  {};
          
            // Level 1 triggers on 1. Will trigger action 1 with affinity 5.
            a0t1.trigger = [11, 0, 0];
            a0t1.action = 0;
            a0t1.affinity = 5;
            

            a0g.tracts[0].push(a0t1);

            var startEnergy = 100;
            var a0 = new Being(0, startEnergy, a0g, 1);
            w1.createSpecificBeing(a0, 0);
            
            chai.expect(w1.stats.beingsAlive).to.equal(1);

/*            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(0);
            w1.tick(actions);

            chai.expect(w1.locations[0].length).to.equal(1);
            chai.expect(w1.locations[0][0].energy).equal(98);

            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(0);
            w1.tick(actions);

            chai.expect(w1.locations[0].length).to.equal(1);
            chai.expect(w1.locations[0][0].energy).equal(96);*/


            // Create a second being that the first one should see
            // Second being is animal of size 5, will be burning 6 energy per turn

            console.log("Creating second animal.")
            var a1g = new Genome(true);
            a1g.size = 5;
            a1g.shape = 7;
            a1g.type = 2;
            a1g.tracts = [];
            a1g.tracts[0] = [];
            a1g.tracts[1] = [];

            var a1 = new Being(1, startEnergy, a1g, 0);
            w1.createSpecificBeing(a1, 2);
            
            chai.expect(w1.stats.beingsAlive).to.equal(2);

            console.log("Executing first tick.")
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            // There should be one actions, as we have designed the vision to react
            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);
            chai.expect(w1.locations[world_size - 8].length).to.equal(1);


            chai.expect(w1.locations[0].length).to.equal(0);

            // Animal one should have burned three, animal two 6 
            chai.expect(w1.locations[world_size - 8][0].energy).equal(97);
            chai.expect(w1.locations[2][0].energy).equal(94);

            console.log("Executing second tick.")
            // Do one more tick, now there should be no movement.
            w1.tick(w1.presentWorldAndGetActions());

            chai.expect(w1.locations[world_size - 8].length).to.equal(1);
            chai.expect(w1.locations[0].length).to.equal(0);

            // Again, they should have burned 3 and 6. (No energy loss at moving?)
            chai.expect(w1.locations[world_size - 8][0].energy).equal(94);
            chai.expect(w1.locations[2][0].energy).equal(88);


            // Now add a one more animal, who has a trigger to eat.
            // This animal has size 2 and will loose 3 energy per turn. 
            // 
            console.log("Creating third animal.")
            var a2g = new Genome(true);
            a2g.size = 2;
            a2g.shape = 5;
            a2g.type = 4;
            a2g.tracts = [];
            a2g.tracts[0] = [];
            a2g.tracts[1] = [];

            //Create tracts for one sense - vision
            var a2t1 =  {};
          
            // Level 1 triggers on 1. Will trigger action 1 with affinity 5.
            a2t1.trigger = [11, 0, 0];
            a2t1.action = 19;
            a2t1.affinity = 5;
            

            a2g.tracts[0].push(a2t1);

            //Create tracts for one sense - vision
            var a2t2 =  {};
          
            // Level 1 triggers on 1. Will trigger action 1 with affinity 5.
            a2t2.trigger = [9, 0, 0];
            a2t2.action = 19;
            a2t2.affinity = 4;

            a2g.tracts[0].push(a2t2);
            var a2 = new Being(2, startEnergy, a2g, 1);
            w1.createSpecificBeing(a2, 0);

            console.log("Executing third tick.")
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);

            // The energy of animal 2 should be 82 minus the damage, which is 8 + 2 - 5 = 5. So 77.
            chai.expect(w1.locations[2][0].energy).equal(77);

            // OK, let's add one more exactly same animal. How will this affect the energy level?
            console.log("Creating fourth animal.")
            var a3g = new Genome(true);
            a3g.size = 2;
            a3g.shape = 5;
            a3g.type = 4;
            a3g.tracts = [];
            a3g.tracts[0] = [];
            a3g.tracts[1] = [];

            //Create tracts for one sense - vision
            var a3t1 =  {};
          
            // Level 1 triggers on 1. Will trigger action 1 with affinity 5.
            a3t1.trigger = [11, 0, 0];
            a3t1.action = 19;
            a3t1.affinity = 5;
            

            a3g.tracts[0].push(a3t1);

            var a3 = new Being(3, startEnergy, a3g, 1);
            w1.createSpecificBeing(a3, 1);

            console.log("Executing fourth tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(2);
            w1.tick(actions);

            // The energy of animal 2 should be 71 minus the damage, which is 10. So 61.
            chai.expect(w1.locations[2][0].energy).equal(61);

            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(2);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].energy).equal(45);

            // Nest step, any lower.
            console.log("Executing fifth tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(2);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].energy).equal(29);

            // Nest step, any lower.
            console.log("Executing sixth tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(2);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].energy).equal(13);

            // Nest step, any lower.
            console.log("Executing seventh tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(2);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].isDead()).true;

            // NOw that animal is dead, energy utilised will be 6 + 1 generic loss = decrease of 7.
            chai.expect(w1.locations[2][0].energy).equal(-3);
            chai.expect(w1.locations[2][0].bodyEnergy).equal(25);


            chai.expect(w1.locations[0][0].energy).equal(82);
            chai.expect(w1.locations[1][0].energy).equal(85);

            // Nest step, and now the animal should be dead.
            // So now there should be some eating? But after dying, the animal has changed shape
            // So now I need another additional tract in order to eat.
            // Ok, I'm giving one of the animals this additional tract. So there should be one actions, everything else the same.
            console.log("Executing eight tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].isDead()).true;

            chai.expect(w1.locations[2][0].energy).equal(-3);
            chai.expect(w1.locations[2][0].bodyEnergy).equal(18);

            chai.expect(w1.locations[0][0].energy).equal(85);
            chai.expect(w1.locations[1][0].energy).equal(82);

            console.log("Executing ninth tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].isDead()).true;
            chai.expect(w1.locations[2][0].energy).equal(-3);
            chai.expect(w1.locations[2][0].bodyEnergy).equal(11);


            chai.expect(w1.locations[0][0].energy).equal(88);
            chai.expect(w1.locations[1][0].energy).equal(79);

            console.log("Executing tenth tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);

            chai.expect(w1.locations[2][0].isDead()).true;
            chai.expect(w1.locations[2][0].energy).equal(-3);
            chai.expect(w1.locations[2][0].bodyEnergy).equal(4);


            chai.expect(w1.locations[0][0].energy).equal(91);
            chai.expect(w1.locations[1][0].energy).equal(76);

            console.log("Executing eleventh tick.");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);

            chai.expect(w1.locations[2].length).equal(0);

            chai.expect(w1.locations[0][0].energy).equal(92);
            chai.expect(w1.locations[1][0].energy).equal(73);


        });

        it("Creates one plant eating animal and tests that", function() {
            var w1 = new World();    
            chai.expect(w1.stats.beingsAlive).to.equal(0);

            // First create a plant
            console.log("Creating plant.");

            var p1g = new Genome(true);
            p1g.size = 6;
            p1g.shape = 5;
            p1g.type = 0;
            p1g.tracts = [];
            p1g.tracts[0] = [];
            p1g.tracts[1] = [];

            var startEnergy = 100;
            var p1 = new Being(0, startEnergy, p1g, 0);
            p1.bodyEnergy = 15;
            w1.createSpecificBeing(p1, 10);
            
            chai.expect(w1.stats.beingsAlive).to.equal(1);

            //Now create a plant eating animal.
            var a1g = new Genome(true);
            a1g.size = 2;
            a1g.shape = 7;
            a1g.type = 2;
            a1g.tracts = [];
            a1g.tracts[0] = [];
            a1g.tracts[1] = [];

            //Create tracts for one sense - vision
            var a1t1 =  {};
          
            // Level 1 triggers on 1. Will trigger action 1 with affinity 5.
            a1t1.trigger = [11, 0, 0];
            a1t1.action = 19;
            a1t1.affinity = 5;
            

            a1g.tracts[0].push(a1t1);

            var a1 = new Being(1, startEnergy, a1g, 1);
            w1.createSpecificBeing(a1, 9);

            // Now execute
            console.log("Tick 1");
            var actions = w1.presentWorldAndGetActions();

            var flatActions = actions.flat().filter(function(el) {
                return (el != null && el.length > 0);
            });

            chai.expect(flatActions.length).to.equal(1);
            w1.tick(actions);

            chai.expect(w1.locations[10][0].energy).equal(94);
            chai.expect(w1.locations[9][0].energy).equal(103);

        });
        
    });