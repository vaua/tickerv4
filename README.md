# Ticker v4 #

            Ispricacu ti jednu pricu Lucija
            jednostavnu, kao kad se ploca snima.

                      Rade Serbedzija, Lucija


## Background ##

Ticker v4 is an attempt to make a biologically inspired simulation engine. The simulation consists of a "world", filled with independent agents (or "animals"). These agents receive inputs from the world, depending on what senses they posses, and then they then act back in the world, depending on their abilities and DNA they have. Animals can also choose to procreate, at which point they spread their genes. To survive, animals need energy, which they get by eating (an action they need to perform when suitable food is present). Animals have different attributes (size, shape, type) which origin from their genes, and have effect on what they eat, how much energy they use when performing different stuff. If an animal runs out of energy, it dies. When an animal procreates, it looses energy that its "kids" get.

The hypotesis is that, over time, certain behavirs should arise (in dimishing probablility, or requiring longer execution time):
- Some animals will specialize in specific ways of finding food and eating, thus becoming successful
- Different survival strategies will emerge
- Strategy of not eating / helping your "kin" (other animals that are genetically similar to yourself)
- Strategy of cooperating with your own kin 
- Communication betweek individuals

| ![alt text](assets/world_1.png?raw=true)
|:--:| 
| *A representation of the world (circle) and animals in different positions* |
| *Red lines, each dot is one animal, line height indicates amount of animals in that position.* |

### High level Goals ###
Ticker v4 has been preceded by earlier simulations (Weko, and even earlier). Through the results of these simulations, I have drawn the conclusion that one of the most important elements (if not the very most important) of these simulations is the evaluation speed. As positive mutations are seldom (as they should be), the pace of evolution is very, very slow once the world becomes big enough to give place for meaningsful evolution and exploration.

Therefore, the main goal of building ticker v4 was to create a meaningful simulation that should be able to execute 1 million animals per second. So one million ticks per second. On available (free) hardware. As part of preparation, I have verified that I can execute one million "void" ticks per second (where no calculation is done). So, the challenge becomes: how much slower will the execution become once menaingful calcultion are done? A meningful calculation includes both calculations that world executes, to be able to provide animals with correct input, as well as calucatons that animals must execute in order to react on given input, in accordance with the genes inherited.

In addition to execution speed, another important paradigm of this simulation was connection of the properies of the world and animals through the properties of the genes themselves. The world becomes intuitively intrepretable to the animals, and their reactions are meaningful for the world.

## Biology ##
The setup of the simulation has some parallells to the real world, which help understand it better. This section describes the main parts and their properties.

### World ###
The world is a one dimensional circular array. It can be likened to a surface of a circle. An universe can consist of several such worlds, with animals being able to jump between them. However, in this first implementation, only one world is included. The size of the world is set by `world_size`. 
The world holds a hashmap of its locations, and contents of them. Each world location can contain zero or more animals, and zero or more units of food.

In the beginning of the simulation, the world is populated by `init_animals` animals. The genome of these animals is fully randomly created (inside the space of genomes), and then placed in specific locations. Once the initial animals are populated, the repeated part of the simulation begins. One "turn" is here called "tick", which has also given the name to the simulation.

#### One tick ####
In the beginning of the tick, all world locations are sent for processing in batches. During processing, the locations are iterated, and each animal contained in these locations is provided with specific inputs calculated relatively to the animal. Once animal processes this input (more about how this is done in subsequent section on animals) it provides an action. Actions for differenct animals in the batch are collected and fed back to the world.

Once all locations have been processed, a list of actions from all animals that provided one is established in the world. Now, the second part of the tick begins. Each action is executed, and changes to the world are calculated. Example of actions could be "move", "eat", "procreate". Each of this will render a change to the world. 

Once all the queued actions are executed, the household activities begin. These include energy reduction for every living animal, roughly proportional to their size and activities. Once this is done, animals with negative enery are proclaimed dead, and thus "food that will not resist for those who can eat it". Other types of foor are replenished. Statistics collected. Logs logged. And then the wheel turns again.

### Animals ###

Animals are agents populating the world. Animals are initially defined by the genome that they are built around. The genome is either fully random, or inherited from a parent (with no or some mututations). The animal starts with some initial energy, random but proportional to the genome size. In each tick of the world, animal will loose some of this energy (again proportional to the genome / animal size). Once the energy falls below zero, the animal dies. To avoid this faith, the animal must eat, and more specifically it needs to eat food that fits it. This renders positive flow of energy. To eat, animal needs to be in proximity of the food, and execute proper action. This is not trivial, as there is nothing in the code saying when or how the animal should eat. This is one of the things that need to evolve in this simulation.

#### Genome ####
The genome is the mechanism that connects the animal to the world, and serves as the link between two domains. It describes the senses by which the animal can percieve the world (and how different senses interpret different inputs), as well as actuators and actions that they can produce (and that have meaning in the world). The genome also defines the private internal mechanism of the animal by which it turns sensory input into actions.

In this current simulation, the genome consists of the following:
- size [0-7]  => A value denoting animal's size. Larger value means bigger animal.
- type [0-7]  => A value denoting animal's type. Lower number mean animal is a plant (no senses). Mid numbers - animal is planteater. Higher numbers - carnivor.
- shape [0-7] => This value does not mean anything to the animal itself, but it is "seen" by other animals. It denotes the "look" of the animal. Animals with similar genes will have similar shape, thus looking the same.
- A number of senses. Currently 2 senses are available, and an animal can have 0, 1 or 2. For each sense:
  - A random number N of trigger-actions pairs. Each trigger-action pair (or _tract_) consist of:
    - A *sensation* trigger to be compared to the sensation coming from the sense. If the input from sense is equal to the trigger, then action is executed.
    - An *action*, to be executed if the trigger is matched.
    - An *affinity*, which is used to choose what action to pick if several are suggested. Affinity can change over time, by animal itself.
    
#### Senses ####
Senses connect the animal to the impressions of the world, as well as provide the actions and their interpretation in the terms of the world. Currently, two senses are implemented:
- vision <= this sense matches with the surrounding of the animal. It allows animal to react to its surroundings.
- internal <= this sense matches with changes in the animal energy level, as well as the absolute level of the energy.

Each sense must provide 3 functions:
- on request, it shall provide a random tract that can interpret input from the sense and provide action
- based on the absolute input from the world, create a subjective input for the specific animal
- based on the action chosen by the animal, translate this action to the absolute world action.


Each sense provides these three functions that are then used by the simulation in order to advance it.

##### Vision #####
When asked to generate genome sequence, vision will create the following:
- Trigger, as a random number represented by 12 bits (3 for size, 3 for shape, 3 for type and 3 for distance from the animal seing it).
- Action, a random number represented by 5 bits. This will be interpretted either as move action (forth or back), or eat action.
- Affinity, initially a random number representing the affinity of this action (to be adjusted during animal life, through other actions)


When asked to create a vision input from the absolute world information, vision sense will iterate through all animals withing locations nearby (within visible range) and create an impression for each of these, consisting of their size, type, shape, as well as the distance from the observing animal. These impressions are presented to the observing animal.

When asked to translate animal action to absolute world action, the vision will first decide whether if was move of eat. If move, it will calculate and provide the new absolute location for the animal. If it was eat, it will do the following:

                // Identify the food.

                // If presumptive food is dead, then consume it. The type will indicate the change of energy.
                // If presumptive food is alive, you have attacked it. Calculate the energy reduction for it.

                // Food are "animals" as well, with specific type and energy (and shape).
                // Initially, they will grow every cycle. But when eaten, they will dissapear.

                // Animals that are killed must "look" different than animals that are alive.
                // Shall their type be set to a low number (and plants are already a low number to begin with?)

                // Idea - lower half of type are plants / dead aninals. Higer half are alive
                // animals. when animals eat, their energy intake is proportional to how close food type
                // is to type-1/2 type span of animal.
                // Wait, no good. Like this - alive plant eater gets most out of eating plants.
                // It gets almost nothing from eating dead animals or attacking alive ones.
                // Carnivores get almost nothing out of eating plants. But they should get good
                // energy out of eating dead herbivores.

                // So, this is the formula: when alive, animals are in the higher half of the type.
                // Third quadrant are herbivours, which go over to carnivours. Lower half -
                // First quadrant are plants, second are dead animals.
                // Eating: energi = abs(myType - foodType - 2^(typeBits-1)
                // Dying: type = type / 2 - 2^(typeBits-1)

                // Just det - huvuddistinktionen mellan animals and plants is that plants
                // do not have vision or internal senses, and their ticking will go very fast.
                // Also, they will be given energy in every turn. Now, initially, they will not
                // be multiplying, but that can change later...


So to recap: Carnivors either eat dead animals, or atack and kill and then eat living animals. Herbivors eat plants. In the end, the appropriate amount of energy will be added to the eating animal, and removed from the living animal / plant.


##### Internal ##### 

###### Gene prep #######
When asked to generate genome sequence, internal will create the following:
- Trigger, as a random number represented by 4 bits (2 for delta energy and 2 for absolute energy).
- Action, a random number represented by 5 bits. This will be interpretted either as move action (forth or back), or eat action.
- Affinity, initially a random number representing the affinity of this action (to be adjusted during animal life, through other actions)

When asked to create an input from the world, internal will look into the animal itself. It will create an impression based on two factors: animals current energy level, and the change of animals energy level since last time. Both of these will provide two bytes of impression, putting the total internal impression at 4 bytes large. Currenty, this is the translation table:

First two bytes:
- animal has more than 85% energy: 3
- animal has more than 50% energy: 2
- enimal has more than 15% energy: 1
- animal has less than 15% energy: 0

Last two bytes:
- Animal got more than 10% energy: 3
- Animal got less than 10% energy: 2
- Animal lost between 0 and 10% energy: 1
- Animal lost more than 10% energy in last tick: 0





- World, animals, DNA, connections, dimensions, calculations
- How are animals made from DNA

**Technical solutions**
- Server client architecture
- Different levels and data models
- Simplifications for calculability
- Found issues

**Discusisons**
- Hade the goals been met?
- Can any theoretical conclusions be made?
- Next step. What is the next step to reach the challenge posted?

