---
title: Gameplay
source_master: Project Up and Down_project description_11.08.2025.md
converted_at: auto
---

[Back to master](Project Up and Down_project description_11.08.2025.md)

> Gameplay specification extracted from master spec. See the master for full context.

### Game concept (general)

Up and Down (UD) is a 2D or 3D multiplayer card game. The main goal is to get as many
guesses correct and use the special effect cards as efficient as possible. The Game is
based on rounds where the “dealer” or the table master plays a card. The card is from a
classic French Suited card deck (52 cards in total). The player now tries to guess if the
next card is higher, lower or the same in value than the card dealt by the table master. If
the player guesses right, he will go to the next round, where he can guess again. If he is
wrong, he will lose this round. The player gains Points for every round he manages to
survive, and the highest scores are displayed in a leaderboard. The game is generally
free to play (exeption casino version), and the player has unlimited tries. However, the
special booster cards cost some diamonds (ingame currency) to buy. He can buy
diamonds and some character designs (skins) in the ingame shop.

The player completes the game if he is able to guess all cards in the deck correctly
(higher,lower or same value) and the game master has played the last card.

Following the description of how a multiplayer game round looks like:

All players (up to 10 per lobby, flexible lobby settings possible, every player can set up
own lobby, entering a lobby with lobby key is possible for private lobbies), spawn in the
spawning area (around the playing table). Every player will get 3 main cards (Up-Card,
Down-Card, Even-Card) in his hand and he can always place up to 5 special effect cards
in his hand as well. The effect card slots can always be changed and the player can
access cards he has purchased before the active round has started. If he purchases a
special effect card during an active round, the card will be only available after the next
active round started. After spawning to the seats, the game master (GM) will start the
game with drawing his first card from his hand. The GM always holds 7 cards in his hand
and has a starting deck of 52 cards (French-suited card set) in total. The hand of the GM
is not visible to the players. Only special effect cards could reveal some parts or the
whole hand from the GM to players who play the special effect card. More on this in the
section special effect cards. The GM chooses the cards he plays always at random from
his 7 hand cards! Now the placing phase of the player starts. All players must place one
of their main cards (Up, Down, Even) cards within the next 10 Seconds and they can play
up to one more special effect card, if they have one in their hand to their special effect
card slot. If the player fails to play a card, he will lose the round automatically. Every
player can only play one card per round. There are four card categories, which the player
can choose from:






1) Up-Card: If the Up-Card is played, the player guesses, that the next card played

by the GM will be of higher value than the current card.

2) Down-Card: If the Down-Card is played, the player guesses, that the next card

played by the GM will be of lower value than the current card.

3) Even-Card: If the Even-Card is played, the player guesses, that the next card

played by the GM will be of the same value than the current card.

4) Special Effect Card: The special effect cards do contain special effects, which
influence the round of the player. More Details about those cards in the special
effects card section.

The player now places his card of choice. If the countdown of 10 Seconds has run down
to zero seconds or every player has played a card, the game phase ends and the new
game phase starts. This game phase is called exchange. During the exchange phase,
player can leave or join lobbies. If there is no player waiting for entry, the game will go to
the next round. If a player decides to leave, he can do that at any point in time, but his
seat will only be free when the next exchange phase takes place (if a player already
disconnected from the active round before the exchange round, his avatar will be
disconnected from the lobby and his seat will become free). If a player fails to play any
card for 3 consecutive rounds, he will be disconnected from the lobby during the next
exchange phase. During the exchange phase all entry animations will be played out (see
Character -> animations for more information), Also the name and title of the joining
player(s) will be displayed in the chat menu. After the exchange phase has been
completed, the next phase starts, where the GM draws a new card. After filling his hand
up to 7 again with drawing a new card he can now play a random card from his hand
again. If the newly played card is higher, than the last played card, every player who has
played the higher card will win and proceed to the next round. If the same value or a
lower value card has been played out by the GM, the respective party who has chosen
the correct card will progress. All other players will be eliminated from this game round.
If a special effect card has been activated, the effect might help a player to survive a
round.

After the GM placed his card, another 10 second cooldown starts, and the players turn
begin again. When the Countdown starts, the player gains a new Up-, Down-, or Even-
Card if they have played it last round. For example, a player played an Up-Card and was
correct, he will get a new Up-Card again to play this round. The special effect cards will
not be replaced but the player can bring a new special effect card from his inventory
deck to the free space in his hand.

The game ends if the GM can not draw any new card from his deck and all his hand cards
are played and after evaluating the result of the last played card from the GM there is
still a player in the game or when all players are eliminated. Leaderboard points are
given to all players depending on their success in the game.



Now we understand the general game concept and design and we are able to dive
deeper into the different aspects of the game development.


### Game mode rapid

The rapid game mode is similar in terms of the gameplay but has some differences. The
card deck is unlimited with cards. That means, if the dealer plays a card, it will get back
into the deck and therefore the game can be continued limitless, until the player gets
eliminated. Rapid game mode is a single player mode, where player can go for high
scores and play fast rounds without having any play delay because of other players and
decision making times.


### Multiplatform & Cross platform

The game needs to run on Android and IOS. The game needs to be cross platform
compatible from the very beginning. This means, that adroid players need to be able to
join IOS lobbies and IOS players need to be able to join Android lobbies. It is preferred to
code the game in Unreal engine, but other engines or coding bases are possible. Please
make a proposal in your offer, which platform you would choose and why.


### General game style

The general game art style is Stylized (cartoony). The whole environment needs to be
bright and deep coloured, fun and for all age groups.

We do not want to have firearms in our game and the game should be for kids as well. No
blood, no unnecessary harm to objects, no oversexualized content, etc.

The characters need to be “Jimmy Neutron”/Bubble head like, with big round heads and
smaller bodies. More in Character design.

All maps and characters need to be in 3D (Jackpot mode different).


### Map

The standard map is in a room with a play table with chairs around it and the GM at the
table. There can be many different room environments like one in a bar, one at the
beach, one on the moon, one on a rift in the ocean, in a circus, an office setup/meeting
room, etc.. The sky is the limit if it comes to map/room design. Important, not every
room is accessible for every player. Some rooms need to be purchased or unlocked with
game progress or high score triggers (get 20 cards correct in a row and unlock this
special room).

The main point on every map is, that it will be a look down (with an angle) map and it
needs to be fun to watch at it. It needs to have details and it needs to set a certain mood.
A bar map needs to set a bar mood, a Moon map needs to set the Moon feeling and so
on.

The Spawn point on the map for all players and need to be set and coded. Generally, the
player will be placed around the table on the existing seats. As long as a chair is free, a
player can join in (if there are no lobby restrictions like a password) and all player spawn
randomly around the table.

First 5 Maps:

1) Beach
2) Pirate ship
3) Moon (can be unlocked by purchasing in the store)
4) Circus (can be unlocked with the achievement of hitting 13 in a row, see

Achievement list for more details)

5) VIP Room/Lounge (only accessible for VIPs)


### Character

The player can choose either a predefined character to play with or design his own
character (costs ingame currency and will be developed in a later stage of the game)
with a character designer (plugin/asset). With the character designer, a player can
modify his own player character as much as he want.

In the first version of the game the player can choose from 3 different characters:

1) Female character






2) Male character
3) Skeleton character (can be purchased in shop or achieved if a player hits 51 in a

row)

Accessorise for every character like hats, bracelets/chains, boots, cloths, etc. can be
bought at the store, if a player wants to give his character a unique style. This addition
will be implemented later, when the character customization will be integrated.


### Movement and animations

The character movements are solely for animations. There is no basic movement since
the player just sits on his chair at the table.

There are a few core animations:

1) Entry animations: An entry animation is a add on which can be bought in the

ingame store or earned through achievements. An entry animation plays every
time a player with an entry animation enters the room. Player can only enter a
room during the exchange phase.

2) Celebration animation: If a player guesses the correct card, his character will
play a little celebration animation. Every character has his own celebration
animation and the player can buy additional celebration animations in the store.

3) Defeat/elimination animation: If a player guesses the wrong card, his character
will play a little defeat/elimination animation. Every character has his own
defeat/elimination animation and the player can buy additional animations in the
store. The standard animation should be a knock back (from the chair) animation
with stars circling around the head of the defeated player. The animation will end,
when the next active game round starts and the player stays at the table.

4) Card animations: If a player plays a special effect card, a special animation will
play. Depending on the rarity of the card, the animation will be more or less
big/crazy.


### Chat & report feature

The multiplayer mode has a chat function. It can swap between Global chat (in the lobby
search/create menu), Friends chat (only for people in your friend list) and Table chat
(only for player on the same table/room). Chat restrictions will be applied if chat is
abused. No voice chat will be integrated.

The game needs a report system built in where the player can report suspicious or
abusive behaviour. It needs to be accessible ingame, in death screen/spectator mode
and after the game. It is important to detect potential cheaters, bug abusers or just
mean and rude people.


### Friendlist and player profile

You can add other players to your friendlist. You can add them by searching for their
name and look up their profile or during a game while clicking on the character of a
player to open up his profile.

In the player profile the player can add more information about him like gender, country
he wants to represent or witch platform he wants to represent (Twitch, Youtube, Discord,
Bigo,…), and also which VIP player he likes to follow.


### Lobbies

Every table is a game lobby. Players can

1) create a lobby
2) enter an existing lobby (if they met the lobby criteria, set by the lobby

owner/creator)

3) delete their created lobby (all player get kicked from the lobby, not possible to

delete the lobby if the game has started)

4) leave a lobby.

Depending on the demand for lobbies, the lobbies can be split into regions, where every
region runs on an individual server. More on that in the server section.


### Start menu & menu screens

The game client has a login and then the player is in the main overview menu. From here
he can choose a character, modify his characters, adjust settings, enter the shop, create
or join lobbies etc. It is the general interface between games. He can dress his character
or modify it. He can enter rankings and generally manage his account. The game
development team has also the possibility to push news and information to the players
via information menu (like shop updates or special events).

Dedicated Server/ infrastructure

Up and Down needs to run on a dedicated server. This is important to scale the project
and be able to form as many lobbies as needed. It helps to make the game more secure
to attacks and cheats as well. If functions can be executed by the dedicated server, it is






preferred to execute it there instead of the player client. Exact server infrastructure
needs to be discussed further, before fully developing the game.

Subsystems can be used from Epic, Steam or Playfab (Microsoft). Please make a
suggestion on your offer on how and where you would set up the infrastructure and why.

Anti cheat system

The multiplayer mode needs a dedicated anti cheat system. The focus is to protect
lobbies from cheaters. Every cheater will be banned for life. It is important, that the
player will never have access to information about the next card played or is in any way
able to manipulate the game to his advantage.

It is important, that no bots or bot systems can run the game. Bot behaviour and auto
click systems need to be detected and banned.

It is very important that the shop mechanism and the rewars system can not be cheated
nor attacked.

It is VERY important, that the Jackpot requirement of winning the game can not be
cheated!

Currently we have not decided on an anti cheat system or a method yet. Needs further
discussion and your input is welcome.

Casino version

In this section we are going to explain a jackpot mode which is suited for casino games.
Up and Down can be implemented with the game aggregator of SoftSwiss
(softswiss.com) through their API. Please do offer a price for bringing the game in the
environment of SoftSwiss to live. Soft Swiss has already developed significant parts of
any game like User management, mechanics, transaction integration etc.

The casino Version has differences to the free to play game in terms of Graphics (could
be in a 2D environment) and it will cost to play the game. Also, the Rapid game mode
could have extra feature and extra jackpots to win. For example: one jackpot for 5 in a
row, 10 in a row, 15 in a row, etc. And every player has to descide if he wants to play for
these jackpots with the representative costs to it. For example, if a player wants to win
all jackpots, he needs to pay more than if he only would like to get the 10 in a row
jackpot. The decision needs to be made at the beginning of the game and depending on
that, he will have to bet more or less.





Last but not least

1) The final product needs to be uploaded on the different stores (Apple App Store,

Android Market, Steam, etc.)

2) The source code and any graphics and IP needs to be handed over to us. We will

always be in control of all rights regarding every aspect of the game.

3) All rights will be reserved by us.
4) The product can be used commercially. All used assets need to fulfil this

standard, and all the copyrights need to be transferred to us.

5) If you want to splitt the project into milestones with separate pay rates per
milestone, we would gladly accept this as well. Please provide a detailed
milestone list in your offer then.
