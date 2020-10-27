# Ticker 4

            Ispricacu ti jednu pricu Lucija
            jednostavnu, kao kad se ploca snima

                      Rade Serbedzija, Lucija


## Background ##

Ticker v4 is an attempt to make a biologically inspired simulation engine. The simulation consists of a "world", filled with independent agents (or "animals"). These agents receive inputs from the world, depending on what senses they posses, and then they then act back in the world, depending on their abilities and DNA they have. Animals can also choose to procreate, at which point they spread their genes. To survive, animals need energy, which they get by eating (an action they need to perform when suitable food is present). Animals have different attributes (size, shape, type) which origin from their genes, and have effect on what they eat, how much energy they use when performing different stuff. If an animal runs out of energy, it dies. When an animal procreates, it looses energy that its "kids" get.

The hypotesis is that, over time, certain behavirs should arise (in dimishing probablility, or requiring longer execution time):
- some animals will specialize in specific ways of finding food and eating, thus becoming successful
- different survival strategies will emerge
- Strategy of not eating / helping your "kin" (other animals that are genetically similar to yourself)
- Strategy of cooperating with your own kin 
- Communication?

| ![alt text](assets/world_1.png?raw=true)
|:--:| 
| *A representation of the world (circle) and animals in different positions* |
| *Red lines, each dot is one animal, line height indicates amount of animals in that position.* |

### High level Goals ###
- Implemented and rest points

Through earlier simulations, I have drawn the conclusion that the most important element of these simulations is the evaluation speed. As positive mutations are seldom (as they should be), the pace of evolution is very, very slow once the world becomes big enough to give place for meaningsful evolution and exploration.
Therefore, the main goal of building ticker v4 was to create a meaningful simulation that should be able to execute 1 million animals per second. So one million ticks per second. On available (free) hardware. As part of preparation, I have verified that I can execute one million "void" ticks per second (where no calculation is done). So, the challenge becomes: how much slower will the execution become once menaingful calcultion are done? A meningful calculation includes both calculations that world executes, to be able to provide animals with correct input, as well as calucatons that animals must execute in order to react on given input, in accordance with the genes inherited.


**Biology**
- What is implemented in the world
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

