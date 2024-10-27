// Global per-simulation variables
// World
var world_size = 1500;    // Number of pixels of the world
var target_beings = 5500; // Amount of beings created when the world is set up
var max_beings_per_location = 900;   // Limit of beings in one location. After this, attempts to spawn more animals will be ignoered
var general_mutation_severity = 35;  // Percentage of chance that there will be some sort of mutation on a genome when offspring is made.

const do_reboots = false;   // Create new beings as the world is winding down.
const reboot_limit = 150;   // Limit of animals that triggers reboot

const wait_between_ticks_to_avoid_overheating_ms = 10;  // Mandatory pause... should explore if needed?

// Being
const max_energy_coefficient = 400;  // Sets maximum energy for the being, together with / multiplied with size (genome)
const old_energy_coefficient = 500;  // Together (multiplied) with size, sets threshold after with maximum energy is diminished (and being dies of old age)

const energy_norm = 200;    // Maximal energy given to randomly created being (multiplied with size)
const energyLoss = 1;          // Base unit of energy use by beings each turn
const energyGain = 1;          // Base unit of energy gain
const energyHighGain = 1;      // Base unit of energy gain in high energy areas
const bodyEnergyContent = 5;   // Base unit of body energy content

const high_growth_areas_number = 5;
const high_growth_areas_size = 20;
//const high_growth_areas = [...Array(high_growth_areas_number).keys()].map(function(id) {return Math.floor(world_size / (id + 1)) - 100 + getRandomInt(200)});
const high_growth_areas = [...Array(high_growth_areas_number).keys()].map(function(id) {return Math.floor(world_size / high_growth_areas_number * id)});
//const high_growth_areas = [0, 100, 200, 300, 400]


// Consts used in triggers
const animalSizeBits = 3;      // Number of bits used to set animal size
const animalTypeBits = 3;      // Number of bits used to set animal type
const animalShapeBits = 3;     // Number of bits used to set animal shape
const distanceBits = 3;        // Number of bits used to set visibility, via distanceSpace
const visionActionBits = 5;    // Number of bits for different vision actions
const affinityBits = 4;        // Number of bits for affinity space
const maxTracts = [32, 8];     // Maximum number of trigger-actions, for each sense (vision: 32, internal: 8)


const animalSizeSpace = Math.pow(2, animalSizeBits);
const animalTypeSpace = Math.pow(2, animalTypeBits);
const animalShapeSpace = Math.pow(2, animalShapeBits);


// Vision sense constants
const distanceSpace = Math.pow(2, distanceBits);
const visionActionSpace = Math.pow(2, visionActionBits);
const visionAffinitySpace = Math.pow(2, affinityBits);
const visibility = distanceSpace;

// Internal sense constants
const animalEnergyBits = 2;  // For internal sense, how many bits are used for absolute energy sensing
const animalEnergyDeltaBits = 2;  // For internal sense, how many bits are used for energy delta sensing
const internalActionBits = 8;  // Action space for all actions caused by internal sense

const internalTriggerSpace = Math.pow(2, (animalEnergyBits + animalEnergyDeltaBits));
const internalActionSpace = Math.pow(2, internalActionBits);
const internalAffinitySpace = Math.pow(2, affinityBits);
const birthTractThreshold = Math.pow(2, (internalActionBits - 1));


// Senses: 0 = vision, 1 = internal
// Below matrix controls what type of beings have what senses. Type 0: no senses. Type 1: only internal. Other types: vision and internal.
const beingTypeToSensesMapping = [[], [1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]];

function getRandomInt(max) {
   return Math.floor(Math.random() * Math.floor(max));
}
  