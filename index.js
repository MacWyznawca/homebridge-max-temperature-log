// Maximum daily temperature Accessory plugin for HomeBridge for read max. temp from [homebridge-mqtt-temperature-log-tasmota] by @MacWyznawca Jaromir Kopp

var inherits = require('util').inherits;
var Service, Characteristic;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-max-temperature-log", "max-temperature-log", MaxTemperatureLogAccessory);
}

function convertDateUTCDtoLocalStr(date, timeOffset) {
	date = new Date(date);
	var localOffset;
	if(timeOffset != 0){
		localOffset = timeOffset * 60000;
	}
	else {
		localOffset = date.getTimezoneOffset() * 60000;
	}
	var localTime = date.getTime();
	date = localTime - localOffset;
	date = (new Date(date)).toISOString().replace(/T/, ' ').replace(/\..+/, '');
	return date;
}

function MaxTemperatureLogAccessory(log, config) {
	this.fs = require("graceful-fs");

	this.log = log;
	this.name = config["name"] || "Sonoff";
	this.manufacturer = config["manufacturer"] || "MacWyznawca";
	this.model = config["model"] || "24h max temp.";
	this.serialNumberMAC = config["serialNumberMAC"] || "";
	this.timeOffset = parseInt(config["timeOffset"]) || 0;
	this.freq = (config["freq"] || 5) * 60000 ;

	this.topic = config["topic"];

	this.filename = this.topic.split("/")[1];

	this.patchToRead = config["patchToRead"] || false;
	if (this.patchToRead) {
		try {
			this.fs.statSync(this.patchToRead);
		} catch (e) {
			try {
				this.fs.statSync("/tmp/");
				this.patchToRead = "/tmp/";
			} catch (e) {
				this.patchToRead = false;
			}
		}
	}

	this.service = new Service.TemperatureSensor(this.name);
	this.service.addOptionalCharacteristic(Characteristic.StatusActive);
	this.service.addOptionalCharacteristic(Characteristic.StatusFault);

	this.temperature = -40.0;
	this.activeStat = true;
	this.faultStat = false;
	this.dateTime = "";

	this.service
		.getCharacteristic(Characteristic.CurrentTemperature)
		.on('get', this.getState.bind(this));

	this.service
		.getCharacteristic(Characteristic.CurrentTemperature)
		.setProps({
			minValue: -50
		});

	this.service
		.getCharacteristic(Characteristic.CurrentTemperature)
		.setProps({
			maxValue: 125
		});

	this.service
		.getCharacteristic(Characteristic.StatusActive)
		.on('get', this.getStatusActive.bind(this));

	this.service
		.getCharacteristic(Characteristic.StatusFault)
		.on("get", this.getStatusFault.bind(this));

	this.Timestamp = function() {
		Characteristic.call(this, 'Timestamp', 'FF000001-0000-1000-8000-135D67EC4377');
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(this.Timestamp, Characteristic);
	this.service.addOptionalCharacteristic(this.Timestamp);

	this.service
		.getCharacteristic(this.Timestamp)
		.on('get', this.getTimestamp.bind(this));

// Initial data read and publish
	this.getState.bind(this);
	
	this.getState.bind(this);
	setInterval(() => {
		this.getState.bind(this);
	}, this.freq);

}

MaxTemperatureLogAccessory.prototype.getState = function(callback) {
	var minMaxTmp = ["", ""];
	try {
		var data = this.fs.readFileSync(this.patchToRead + this.filename + "_maxTemp.txt", 'utf8');
	} catch (err) {
		this.log(err)
		this.activeStat = false;
	}
	if (!data) {
		this.log("Problem read min. temp. file");
		this.activeStat = false;
	} else {
		this.activeStat = true;
		minMaxTmp = data.split("\t");
		this.temperature = parseFloat(minMaxTmp[1]);
		if((new Date(minMaxTmp[0])).getTime()>0){			
			this.dateTime = convertDateUTCDtoLocalStr(new Date(minMaxTmp[0]),this.timeOffset);
			var date = (new Date(minMaxTmp[0])).getTime();
			if ((new Date).getTime() - date > 90000000) {
				this.faultStat = true;
			} else {
				this.faultStat = false;
			}
		}
		else {
			this.faultStat = true;
		}
	}
	this.service.setCharacteristic(this.Timestamp, this.dateTime);
	this.service.setCharacteristic(Characteristic.StatusActive, this.activeStat);
	this.service.setCharacteristic(Characteristic.StatusFault, this.faultStat);

	callback(null, this.temperature);
}

MaxTemperatureLogAccessory.prototype.getStatusActive = function(callback) {
	callback(null, this.activeStat);
}

MaxTemperatureLogAccessory.prototype.getStatusFault = function(callback) {
	callback(null, this.faultStat);
}
MaxTemperatureLogAccessory.prototype.getTimestamp = function(callback) {
	callback(null, this.dateTime);
}

MaxTemperatureLogAccessory.prototype.getServices = function() {

	var informationService = new Service.AccessoryInformation();

	informationService
		.setCharacteristic(Characteristic.Name, this.name)
		.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
		.setCharacteristic(Characteristic.Model, this.model)
		.setCharacteristic(Characteristic.SerialNumber, this.serialNumberMAC);

	return [informationService, this.service];
}
