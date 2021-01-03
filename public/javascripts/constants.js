 // World
const world_size = 1500;
const energy_norm = 200;
const target_beings = 5550;
const do_reboots = true;
const reboot_limit = 10;
const max_beings_per_location = 60;

const high_growth_areas_number = 5;
const high_growth_areas_size = 20;
const high_growth_areas = [...Array(high_growth_areas_number).keys()].map(function(id) {return Math.floor(world_size / id) - 100 + getRandomInt(200)});
 // Animal

 const max_energy_coefficient = 400;
 const old_energy_coefficient = 500;
 // Consts used in triggers
const animalSizeBits = 3;
const animalTypeBits = 3;
const animalShapeBits = 3;
const distanceBits = 3;
const visionActionBits = 5;
const affinityBits = 4;
const maxTracts = [64, 12];

const animalSizeSpace = Math.pow(2, animalSizeBits);
const animalTypeSpace = Math.pow(2, animalTypeBits);
const animalShapeSpace = Math.pow(2, animalShapeBits);
const distanceSpace = Math.pow(2, distanceBits);


const visibility = distanceSpace;

// Must all sense functions take same params? Most likely no.
// How mamy action bits?
const animalEnergyBits = 2;
const animalEnergyDeltaBits = 2;
const internalActionBits = 8;

const internalTriggerSpace = Math.pow(2, (animalEnergyBits + animalEnergyDeltaBits));
const internalActionSpace = Math.pow(2, internalActionBits);
const birthTractThreshold = Math.pow(2, (internalActionBits - 1));


// Senses: 0 = vision, 1 = internal
const beingTypeToSensesMapping = [[], [1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]];

function getRandomInt(max) {
   return Math.floor(Math.random() * Math.floor(max));
}
  