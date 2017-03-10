# homebridge-max-temperature-log

HomeBridge plugin to show daily maximum temperature.. It requires: [**[homebridge-mqtt-temperature-log-tasmota]**](https://www.npmjs.com/package/homebridge-mqtt-temperature-log-tasmota).

Like this? Please buy me a beer (or coffee) ;-) <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=CK56Q7SFHEHSW"><img src="http://macwyznawca.pl/donate-paypal2.png" alt="Donate a coder" data-canonical-src="http://macwyznawca.pl/donate-paypal.svg" style="max-width:100%;"></a>

[MacWyznawca.pl](http://macwyznawca.pl) Jaromir Kopp

Installation
--------------------
    sudo npm install -g homebridge-max-temperature-log

Sample HomeBridge Configuration
--------------------

{
	
    "bridge": {
        "name": "Homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "031-45-154"
    },
    
    "description": "This is an example configuration file. You can use this as a template for creating your own configuration file.",
	
    "platforms": [],
	
	"accessories": [
		{
			"accessory": "max-temperature-log",
			
			"name": "Max temperature",
			
			"topic": "tele/sonoffrf200/SENSOR",
			
			"patchToRead":"/root/.homebridge/",
						
			"freq": "2"
		}
	]
}

# Description of the configuration file.

**"topic"** - must by the same like in **homebridge-mqtt-temperature-log-tasmota** config!

**"patchToRead":"/root/.homebridge/"** - path to save text files with temperature data. Must by the same like in **homebridge-mqtt-temperature-log-tasmota** config!

**"freq": "2"** - How often has a plugin to publish information (minutes).