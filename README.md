# Ticker 4

            _Ispricacu ti jednu pricu Lucija_
            _jednostavnu, kao kad se ploca snima_

                      Rade Serbedzija, Lucija


Background

Ticker v4 is an attempt to make a biologically inspired simulation engine. 

High Goals
- Implemented and rest points

Through earlier simulations, I have drawn the conclusion that the most important element of these simulations is the evaluation speed. As positive mutations are seldom (as they should be), the pace of evolution is very, very slow once the world becomes big enough to give place for meaningsful evolution and exploration.
Therefore, the main goal of building ticker v4 was to create a meaningful simulation that should be able to execute 1 million animals per second. So one million ticks per second. On available (free) hardware. As part of preparation, I have verified that I can execute one million "void" ticks per second (where no calculation is done). So, the challenge becomes: how much slower will the execution become once menaingful calcultion are done? A meningful calculation includes both calculations that world executes, to be able to provide animals with correct input, as well as calucatons that animals must execute in order to react on given input, in accordance with the genes inherited.


Biology
- What is implemented in the world
- World, animals, DNA, connections, dimensions, calculations
- How are animals made from DNA

Technical
- Server client architecture
- Different levels and data models
- Simplifications for calculability
- Found issues

Discusisons
- Hade the goals been met?
- Can any theoretical conclusions be made?
- Next step. What is


What is this?

This project aims at creating a world inhibited with small animals. Animals in their own turn consist of cells, and always start out with one single cell (sounds familiar)?
Each animal has its own specific (random initially) DNA, which is placed in each animal cell and controls the actions of the cell. 
In each point in time, each cell in animal can decide whether to duplicate and create another cell (animal grows) to specialize and become for instance a neural cell, or to specialize even more and become motor or sensory cell.
Cells that turn into neural cells create a neural network, that (if connections are right, and yes, the connection pattern is also controlled by the DNA) can get inputs from sensory cells and control in turn motor cells.
Animals are not alone in the world, there is also food and danger. Animals need food to increase their health, as each tick in time deminishes their health (the more cells they have the more health is deminished). Also meeting danger has negative impact on the health.
Animals can also choose to fork (and this is also controlled by DNA). When forking, the animal creates a new single-cell animal entity that will have same or slightly mutated DNA as the original cell, while paying a price in health.
If animal health goes to 0 or below, it dies.

So, what's the point, purpose and the goal of all this? Well, the postulate is that over time and countless random DNA strains and mutation, such animal forms will appear that have a simple neural network that can take in inputs from the world (where is food and danger) and then move the animal accordingly in this little world to maximaze the food intake and minimize the danger exposure. At this point, we have created someting akin to an artificial C.elegans or similar. Now, with the working sensed and some good DNA strains, we can start increasing the sensory inputs and types of things in the world, while constantly evolving the animals. Then? Who knows. No idea. But this is exciting. It is within the reach, and it really feels like a first baby step towards creating a body for general artificial intelligence. Sorry. I went overboard. But admit, it is exciting!

But just a crazy example. Let's say we get that far that we create a sensory organ for reading and consuming letters. And then a motory organ that can produce HTTP commands to move around the WWW. Then we unleash the animal to move across the internet, read the pages, consume and (over time) understand them. Understanding is the last step where cortex-like feature will be needed (hello HTM!) But we will have a body and basal brain to smack it on! Holy cow and happy day together!

How to participate?

At this point, it is too early to participate in any form other than encuraging me and telling me how awesome this is and how you've been dreaming about this your whole life (like I have). Soon enough, in a few weeks, months or years, there will be a web site, where you will be able to see simulations running. At that point, a greater degree of participation will be possible. Until then, tata!
