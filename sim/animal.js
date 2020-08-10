var Cell = require("./cell.js");
var debug = require('debug')('animal');
var Constant = require('./constants.js');

function Animal(dna, id, position, world, initialCell, ancestor) {
    this.dna = dna;
    this.id = id;
    this.age = 0;
    this.world = world;

    this.position = position;
    this.moves = 0;
    this.left = 0;
    this.right = 0;
    this.ancestor = ancestor;
    this.foodEatenLeft = 0;
    // Initiate the original cell to the original values
    this.health = Constant.INITIAL_HEALTH;
    // Create the initial cell
}



Animal.prototype.tick = function() {

    var that = this;
    this.age++;

    // Now, all cells have ticked. Let's run the neural network.
    // Get inputs from the world and set optical cells.
    // Position: 0: food left, 1: danger left, 2: food right, 3: danger right.
    // Inputs get these values in order.



    
    var report = {};
    report.id = this.id;
    report.age = this.age;

    this.world.reportAnimal(report);

    debug("Animal " + this.id + " has  health of " + this.health + ".");
}

Animal.prototype.spawnNewAnimal = function(dna, proteins, cellType) {
    this.world.createAnimal(new Cell("newbie", this, dna, proteins, cellType, 0), this.position);
}

Animal.prototype.addForRemoval = function(cell) {
    this.deadCells.push(cell);
}

Animal.prototype.addNeuralCell = function(cell) {
    this.neuralCells.push(cell);
}

Animal.prototype.addMotorCell = function(cell) {
    this.motorCells.push(cell);
}

Animal.prototype.addOpticalCell = function(cell) {
    this.opticalCells.push(cell);
}

Animal.prototype.addCellWithWillingDendrites = function(cell) {
    this.cellsWithWillingDendrites.add(cell);
}

Animal.prototype.addCellAcceptingDendrites = function(cell) {
    this.cellsAcceptingDendrites.add(cell);
}

module.exports = Animal;
