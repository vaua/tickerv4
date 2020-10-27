# Ticker 4

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

