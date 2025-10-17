---
title: Project Up and Down — Project Description (2025-08-11)
source_pdf: Project Up and Down_project description_11.08.2025.pdf
converted_at: auto
---

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Sections](#sections)
  - [Game concept (general)](#game-concept-general)
  - [Game mode rapid](#game-mode-rapid)
  - [Multiplatform \& Cross platform](#multiplatform--cross-platform)
  - [General game style](#general-game-style)
  - [Map](#map)
  - [Character](#character)
  - [Movement and animations](#movement-and-animations)
  - [Special cards](#special-cards)
  - [Gm.](#gm)
  - [Chat \& report feature](#chat--report-feature)
  - [Friendlist and player profile](#friendlist-and-player-profile)
  - [Lobbies](#lobbies)
  - [Ranking and High scores](#ranking-and-high-scores)
  - [Rewards and Achievements](#rewards-and-achievements)
  - [Jackpot (in the free to play version)](#jackpot-in-the-free-to-play-version)
  - [VIP Players](#vip-players)
  - [Game shop and microtransactions](#game-shop-and-microtransactions)
  - [Start menu \& menu screens](#start-menu--menu-screens)

## Sections
- [Gameplay](./gameplay.md)
- [Cards](./cards.md)
- [Economy](./economy.md)

Project «Up and Down»

Detailed project description

We Care More GmbH

Moosmattstrasse 4

CH-6331 Hünenberg

info@wecaremore.ch








Content
Game concept (general) ........................................................................................... 4

Game mode rapid ..................................................................................................... 6

Multiplatform & Cross platform ................................................................................. 6

General game style ................................................................................................... 6

Map ......................................................................................................................... 7

Character ................................................................................................................ 7

Movement and animations .................................................................................... 8

Special cards ........................................................................................................... 8

Chat & report feature .............................................................................................. 10

Friendlist and player profile ..................................................................................... 11

Lobbies ................................................................................................................. 11

Ranking and High scores ......................................................................................... 11

Rewards and Achievements .................................................................................... 12

Jackpot (in the free to play version) .......................................................................... 18

VIP Players ............................................................................................................. 18

Multilanguage ........................................................................................................ 18

Game shop and microtransactions .......................................................................... 18

Start menu & menu screens .................................................................................... 19

Dedicated Server/ infrastructure ............................................................................. 19

Anti cheat system ................................................................................................... 20

Casino version ....................................................................................................... 20

Last but not least.................................................................................................... 21














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

### Special cards

All special cards are labelled with a level. Every special effect card can only be played
once per active game and player, some are restricted to only once per active round and
table. All special effect cards will be shown after the countdown has reached 0 to all
players. If a identical special effect card played more than once, which has an effect for
multiple players the effect will only take place once. No effects can be staked. However,
the effects from cards will be activated due to priority and as higher the level of a card is
as hight is its priority. For example. If multiple special effect cards have been played out,




the level 3 cards effects will be carried out bevore the level 2 Cards. If a player A plays
the special effect card One for the team and Player B plays Sacrifice on player A, Player
A will die due to the priority of the One for the team card over the Sacrifice card.

Level 1: Special effects, which do not have much of an impact on the game and do not
last longer than one round.

Level 2: Special effects can be put on other players as well as the player owning/playing
it. The effect lasts for one round.

Level 3: Special effects which can affect one or more player for more than one round.

Level 1:

- Mass intelligence: If more than 50% of the player on the table are right, the player

who played the special effect card will survive.

- Protective Shell: The player survives this round no matter the card played by the

### Gm.

- Seeker: See 3 out of 7 cards from the GM before he plays his next card.
- The secret of the past: Check all cards which have been played by the GM up to

this point. Only available until Round 45.

- Equalizer: If another player plays the Even card and you play a Up or Down card
and the outcome of the next card drawn by the GM is an even result (for example
last round he draws a 6 of Heart and this round a 6 of Spades, its even) you will
survive this round too.

- Early bird: This card can only be played at the very first round of an active game. If
the player achieves a streak of 10 in a row, he will be protected in the 11th round
for one round.

Level 2:

- All for all: If more than 50% of the player on the table are right, every player

survives the round.

- Rewind time. Change the outcome of one players result but not your own after

the GM played his next card. This card can only be received once per active round
and player. No limitations on playing it out to all other players.

- Protective Shelter: All players survive the next round. This card can only be played

once per round over all players. (once per game).

- Sharing is caring: Let all players see 3 out of 7 cards from the GMs hand. This card

can only be played once per active round and table.





- Sacrifice: you can sacrifice your own round to protect another player on the table
for one round. A player can only receive one sacrifice per active game and table.
The player who plays the sacrifice card will be eliminated in the round he played
the card, no matter the outcome of his own card played.

- 2 & 7: If the next card is a 2 or a 7, the player will survive the next 2 rounds no

matter the outcome of the rounds.

- Protective Ace: If the next card drawn by the GM is an Ace, all players will survive

the round no matter of the outcome of their hand.

Level 3:

- No secrets: Let all players see all 7 cards from the GMs hand. This card can only
be played once per active round and table. Can only be played until round 40.
- Protective Fireplace: The player survives 3 rounds no matter which card the GM

plays.

- Great prophet: See all 7 cards of the GM before the next card will be played by the

GM. Can only be played until round 40.

- Lucky 7: If the next card played by the GM is a 7 the player will be protected by the

next 3 rounds. Can only be activated until round 40.

- One for the team: The player who played this card will not survive the round. But
every other player will, no matter the outcome of a the round. This card can only
be played once per table.

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

### Ranking and High scores

Every player gets points, depending on his success in guessing the correct cards. There
are points per correct guessed card, and minus points, if the card was guessed wrong.
However, there are always more points to gain than to lose. Therefore, player usually get
higher total scores if they play more. Bonus points are rewarded for longer correct
guessing streaks. For example, every 5 correct cards in a row (5-10-15-20-…) will have a
point multiplicator. Players will also get special cards as rewards if they manage to hit a
certain amount of consecutive right guesses. Those special cards can be used in future
matches/game rounds but not in the ongoing one. Therefore, all achievements come
within the shop system/gift section. The player needs to claim the reward first, before
using it in a game. The leaderboards will show the players with the most points in a
ranking. The ranking is with all players in it and players can check the top 100 players
and the next 50 players before them and the next 50 players behind them in the high
score list. If two players have the same number of points, the one who achieved the
points first will stay at the top.




Additional to the total point rankings a max streak ranking is included as well. The top
100 players with the highest streak of guessing the correct card in a row will be ranked
there.

There will be rankings for “VIP” as well, where a player can choose a VIP player to follow
or help in the rankings. This way popular player can combine points of followers to
obtain top spots in a separate ranking. For example a player can choose various rankings
like country ranking, platform ranking (Youtube, Twitch, etc.) and many more.

Several Ranking intervals can be displayed like Daily, Weekly, Monthly, yearly and All
time hight rankings. On the base of those rankings different rewards can be distributed.

### Rewards and Achievements

Players can get several rewards if they achieve ranking positions or streaks during the
game. Following the Rewards and rankings, that can be obtained

Most points Ranking by the end of period:

| Ranking Position | Daily | Weekly | Monthly | Yearly |
|-----------------|---------|---------|----------|------------|
| 10th-4th place  | 100 D   | 1'000 D | 10'000 D | 100'000 D  |
| 3rd place       | 200 D   | 2'000 D | 20'000 D | 200'000 D  |
| 2nd place       | 300 D   | 3'000 D | 30'000 D | 300'000 D  |
| 1st place       | 1'000 D | 10'000 D| 100'000 D| 1'000'000 D|















**Highest streak per end of Period**

| Ranking Position | Monthly | Yearly |
|-----------------|----------|------------|
| 10th-4th place  | 10'000 D | 100'000 D  |
| 3rd place       | 20'000 D | 200'000 D  |
| 2nd place       | 30'000 D | 300'000 D  |
| 1st place       | 100'000 D| 1'000'000 D|

**Achievements to unlock by progress** (only obtainable once):

| Achievement | Reward |
|-------------|--------|
| Winning your first game | 10 D |
| Getting a streak of 5 within one active game round | 50 D |
| Getting a streak of 10 within one active game round | 1 random Level 1 Special Effect card |
| Getting a streak of 15 within one active game round | 150 D |
| Getting a streak of 20 within one active game round | 1 random Level 2 Special Effect card |
| Getting a streak of 25 within one active game round | 500 D |
| Getting a streak of 30 within one active game round | 1 random Level 3 Special Effect card |
| Getting a streak of 35 within one active game round | 1'000 D |
| Getting a streak of 40 within one active game round | 1 random Level 3 Special Effect card + 1'000 D |
| Getting a streak of 45 within one active game round | 2 random Level 3 Special Effect card + 2'000 D |
| Getting a streak of 50 within one active game round | 5 random Level 3 Special Effect cards + 5'000 D |
| Getting a streak of 52 within one active game round and complete the game | Jackpot win plus every available card once. Highest VIP Level forever |
















**Social/Multiplayer Achievements:**

| Achievement | Reward |
|-------------|--------|
| Playing a game with other players on the table | 50 D |
| Play 3 games with a friend of yours | 30 D |

**Gift Sending Achievements:**

| Achievement | Reward |
|-------------|--------|
| Send a gift to another player | 10 D |
| Send a total of 10 gifts to another player | 100 D |
| Send a total of 100 gifts to another player | 1'000 D |
| Send a total of 1'000 gifts to another player | 10'000 D |

**Gift Receiving Achievements:**

| Achievement | Reward |
|-------------|--------|
| Receive a gift from another player | 20 D |
| Receive a total of 10 gifts from other players | 200 D |
| Receive a total of 100 gifts from other players | 2'000 D |
| Receive a total of 1'000 gifts from other players | 20'000 D |

**Special Effect Card - Playing Achievements:**

| Achievement | Reward |
|-------------|--------|
| Play your first Special Effect card | 50 D |
| Play a total of 5 Special Effect cards | 100 D |
| Play a total of 5 Special Effect cards in one active game round | 200 D |
| Play more than 10 Special Effect cards in total | 500 D |
| Play more than 100 Special Effect cards in total | 10'000 D |

**Special Effect Card - Receiving Achievements:**

| Achievement | Reward |
|-------------|--------|
| Receive an effect of a Special Effect card five times | 50 D |
| Receive an effect of a Special Effect card 10 times | 100 D |
| Receive an effect of a Special Effect card 100 times | 1'000 D |

**Title rewards**

Title rewards can only be obtained by fulfilling specific conditions. A player can display
one of his earned titles bellow his name. All titles are stored in his profile. There are
unique titles which are only given to the first placed player on that particular topic. The
unique titles will be transferred to other players if they overtake/pass the current title
holder on the specific metric to gain the title.

Every time one of the unique titles switch holders, a system notification will be shown in
all chatrooms. The old title holder will get a notification in his notification center.










| Title | How to Obtain |
|-------|---------------|
| The first | The first player to win a game in the history of Up and Down |
| Patient Zero | The first player to loose a game in the history of Up and Down |
| Winner Winner Chicken Dinner | Maintaining a minimum of 5 streak per active game round over 10 consecutive rounds |
| Millionaire | Spend over 1'000'000 Diamonds |
| Billionaire | Spend over 1'000'000'000 Diamonds |
| Kind heart | Gift over 100 gifts to other players |
| Protector | Safe more than 100 player from elimination |
| Great protector | Safe more than 1'000 player from elimination |
| THE Protector | Titel only granted the one player with the highest number of saved players. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of saved players ranking. |
| Unlucky Fellow | Lose more than 10 active rounds in a row with your first card. |
| Black cat | Lose more than 100 active rounds in a row with your first card. |
| Jinx | Titel only granted the one player with the highest number of lost games in a row by the first card. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of lost games in a row by the first card ranking. |
| Luck is everything | Win more than 10 first rounds in active rounds in a row. |
| Luck is not everything | Win more than 100 first rounds in active rounds in a row. |
| I AM LUCK | Titel only granted the one player with the highest number of consecutive first round wins in active rounds. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of consecutive first round wins in active rounds ranking. |
| Gifter | Gift more than 10 gifts to other players |
| Your presence is a gift itself | Gift more than 100 gifts to other players |
| Santa Claus | Titel only granted the one player with the highest number of gifts sent to other players. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of gifts sent to other players ranking. |
| Gifted | Receive more than 10 gifts from other players |
| Popular | Receive more than 100 gifts from other players |
| Idol | Titel only granted the one player with the highest number of gifts received from other players. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of gifts received from other players ranking. |
| VIP | Purchase a VIP of the highest level for one week. |
| Dedicated VIP | Contain the VIP status of the highest VIP level for more than 5 Weeks |
| THE VIP | Titel only granted the one player with the highest number of consecutive weeks with the highest VIP level activated. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the consecutive weeks with the highest VIP level activated. ranking. |
| Special Effect rookie | Play more than 10 Special Effect cards |
| Special Effect Master | Play more than 100 Special Effect cards |
| Magician | Titel only granted the one player with the highest number of Special Effect cards played. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of Special Effect cards played ranking. |
| Shop user | Buy more than 10 things from the shop |
| Shop owner | Buy more than 100 things from the shop |
| Business mogul | Titel only granted the one player with the highest number of bought things from the shop. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of bought things from the shop ranking. |
| Daily topshot | Win more than 5 daily top rankings |
| Daily master | Win more than 10 daily top rankings |
| Daily King | Titel only granted the one player with the highest number of daily top ranking wins. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of daily top ranking wins. |
| Weekly topshot | Win more than 5 weekly top rankings |
| Weekly master | Win more than 10 weekly top rankings |
| Weekly King | Titel only granted the one player with the highest number of weekly top ranking wins. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of weekly top ranking wins. |
| Monthly topshot | Win more than 5 monthly top rankings |
| Monthly master | Win more than 10 monthly top rankings |
| Monthly King | Titel only granted the one player with the highest number of Monthly top ranking wins. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of Monthly top ranking wins. |
| Yearly champion | Win one or more yearly top rankings |
| Yearly King | Titel only granted the one player with the highest number of daily top ranking wins. This title can only be obtained by one player at any time and is lost if another player overtakes the current holder in the numbers of daily top ranking wins. |
| Among the tops | Place within the top 10 of the yearly rankings by the end of the ranking duration time. |
| Generation 42 | Reach round 42 to receive this title |
| Champion | Granted to every player who is able to complete the game. |
| The first complete beeing | Granted to the first player who can achieve all titles |
| Complete beeing | Granted to every player who can achieve all titles |
| THE ONE | Granted to the player who achieves all title at the same time. This title can only be hold by one player at a time. If the title condition is not active anymore, the title will remain unusable by any player. |


### Jackpot (in the free to play version)

The game will have a Jackpot which will be gained by the player who finishes the game.
After a player has finished the game the Jackpot will go down to 0 Diamonds and start to
fill up again.

The first Jackpot will start with 10’000’000 Diamonds and 1% of all Diamonds purchased
from the shop by players will be added to the jackpot sum.

If a player wins the game and is entitled to the jackpot, we need to ensure, that the
jackpot is achieved legitimately. If the jackpot is achieved legitimately we reward the
player with the jackpot Diamonds.

### VIP Players

The VIP Status can be obtained by purchasing it in the shop. It needs to be renewed
every week (it will automatically renew, if the player does not revoke it and as long as a
player has enough Diamonds on his account). VIP Player get a special VIP Tag next to
their name, their name will be in golden Letters, they get a special VIP Entry Animation
and access to the VIP Maps. More VIP Content will be delivered over time. Depending on
the VIP Level, the player will get the rewards.

Multilanguage

The game needs to be translatable in every language. It starts in English and the first
Language to add is German. After the game is launched and works well with the
audience, further languages will be added.

### Game shop and microtransactions

One of the essential parts of the game is the ingame shop. In the shop a player can buy:

1) Daily bonuses and reward (free rewards, free cards or free Diamonds)
2) Diamond Packs
3) Special Effect cards
4) Character and Assecoires / Skins
5) Maps
6) VIP Levels
7) Coupons





8) Gifts.

The shop needs to be easy to access through the main menu (before lobby menu) and
while playing in a lobby (shop button on map/table). Also, it should be able to accept all
major payment methods.

Following items will be in the shop:

| Daily Bonuses and rewards | Diamonds pack | Special cards | Characters and Assecoires | Maps | VIP Levels | Coupons | Gifts |
|---------------------------|---------------|---------------|---------------------------|------|------------|---------|-------|
| • Daily bonus for playing the game.<br>Random low lever reward | • 100 Diamonds for $1<br>• 1'100 D for $10<br>• 2'500 D for $20<br>• 6'500 D for $50<br>• 10'000 D for $85<br>• 15'000 D for $100<br>• 200'000 D for $1'000 | • Special cards level 1 for 100 D per card<br>• Special cards level 2 for 250 D per card<br>• Special cards level 3 for 1'000 D per card | • Skeleton character for 1'400 D<br>• Further Assecoires will be added to the shop. | • Moon map for 5'000 D | • VIP 1: Vip - Badge next to name for 100 D/Week<br>• VIP 2: VIP - Badge and Golden Letters name for 200 D/Week<br>• VIP 3: All - All rewards from Lvl 2 + Custom Entry animation for 300 D/Week<br>• VIP 4: all - All rewards from VIP 3 + VIP Map access for 500 D/Week | • Players can exchange Diamonds for Coupons. Like Amazon, Paysafe or any other coupon there is.<br>• The coupon vallue will always be 90% of the Diamonds Value. For example a $10 Amazon coupon will cost 2'200 D (highest D/USD convertion rate + 10%)<br>• Coupons allow to "Cash out" any price money which is distributed or earned by rewards. | • Several gifts to send to other players on the same table. For example a "Rose". A "Rose" costs 10 D and the receiving party gets 1 D added to their D count.<br>• This feature can be added later on<br>• Every gift has a small animation. |

**VIP Levels:**

| VIP Level | Benefits | Weekly Cost | Initial Cost |
|-----------|----------|-------------|--------------|
| VIP 1: Vip | Badge next to name | 100 D/Week | 5'000 D |
| VIP 2: VIP | Badge and Golden Letters name | 200 D/Week | - |
| VIP 3: All | All rewards from Lvl 2 + Custom Entry animation | 300 D/Week | - |
| VIP 4: All | All rewards from VIP 3 + VIP Map access | 500 D/Week | - |

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