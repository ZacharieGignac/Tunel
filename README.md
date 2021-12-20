# Tunel
Lightweight and super simple communication system for room automation.

This system is in early dev. Not much is working for now. This is mostly a proof of concept.

# Websocket Server (tunel_start.js)
* The best choice for live webpage
* Multi-client (how much ram do you have?)
* Keep alive and disconnection detection
* Security (token)

# Websocket Client (tunel.js)
* Connection management
* Keep alive and disconnection detection
* Widgets synchronization
* HTML and Server-side object binding (1 way or 2 ways)
* Server function calls, with or without return values

# Next up
* Events (both ways)
* Server-Side widget management
* REST-API
* Web-server
* Token manager

# Installation
* Configure the "config" object in the tunel.js file (client-side)
* Run the server (tunel_start.js)
* Add the lib to your website using *<script src="tunel.js"></script>*

# Mini API docs
## Checking connection status
```JS
$tunelConnection.onStatusChanged(connection => {
  console.log(connection.status);
  if (connection.status == 'connected') {
    //this checkup is necessary to use the other api commands
  }
});
```

## Listening to a server-side widget change
```JS
$tunelWidgets('volume').onChange(widget => {
    console.log(`${wid.id} value changed to ${wid.value}`);
});
```

## Binding a server-side widget value to a HTML element
HTML
```HTML
The volume is <span id='volume'></span>%
<input type='text' id='voltextbox' value=''>
```
JS
```JS
$tunelWidgets('volume').addInputBinding('volume','innerHTML');
$tunelWidgets('volume').addInputBinding('voltextbox','value');
```

## Binding a HTML element to a server-side widget
HTML
```HTML
<input type="range" min="1" max="100" value="50" id="volume">
```
JS
```JS
$tunelWidgets('volume').addOutputBinding('volume','value','change');
```

## Binding a HTML element and a server-side widget both-ways
HTML
```HTML
<input type="range" min="1" max="100" value="50" id="volume">
```
JS
```JS
$tunelWidgets('volume').addTwoWayBinding('volume', 'value', 'change');
```

## Calling a server-side function without return value
```JS
$tunelFunction('testFunction').call();
$tunelFunction('testFunctionWithArg').call('yay!');
```

## Calling a server-side function with return value
```JS
$tunelFunction('getLampHours').call('args here', hours => {
    console.log(hours);
});
```

# HTTP URL API
## Get widget value:
```
http://ip/api/v1/token/widgets/widgetid/get
```

## Set widget value
```
http://ip/api/v1/token/widgets/widgetid/set/value
```

# REST API
## Get widget value
'HTTP GET' request to:
```
http://ip/api/v1/widgets
```
Body:
```JS
{
  token:<token here>,
  id:<id here>,
}
```
## Get widget value
'HTTP PUT' request to:
```
http://ip/api/v1/widgets
```
Body:
```JS
{
  token:<token here>,
  id:<id here>,
  value:<value here>
}
```
