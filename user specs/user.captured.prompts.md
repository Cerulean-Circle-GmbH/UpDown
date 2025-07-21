- on the front end side the same classes have to be loaded as on the backend. the state of these classes has to be synced in realtime on any change. the front end shall be programmed in a very declarative way. here an idea for a web component usage on the cliient index.html page:

    ```
    <web4-router>
    <web4-route page="Lobby" path="lobby">
    <web4-route page="Login" path="login">
    <web4-route page="Player" path="login/player">
    <web4-route page="Spectator" path="login/spectator">
    ...
    </web4-router>
    ```

    while  web4-router is a webComponent extending a serverside component and configuring the app in a declarative way. the attributes of the tags are the same as the model attributes in the corresponding classes and will also be reflected in the scenarios, that are then exchnaged for sync.

    Please check ho this spec influences the itteration2 and add it to the high level iteration2 file and see how the itteration 2 files will change. then go on as planned.