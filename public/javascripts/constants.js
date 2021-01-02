 // World
const world_size = 1500;
const energy_norm = 200;
const target_beings = 1550;
const do_reboots = false;
const reboot_limit = 500;

 
 
 // Consts used in triggers
const animalSizeBits = 3;
const animalTypeBits = 3;
const animalShapeBits = 3;
const distanceBits = 3;
const visionActionBits = 5;
const affinityBits = 4;
const maxTracts = 64;

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

// Senses: 0 = vision, 1 = internal
const beingTypeToSensesMapping = [[], [1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]];

function getRandomInt(max) {
   return Math.floor(Math.random() * Math.floor(max));
}
  