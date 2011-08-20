/**
 * Copyright (C) 2008 Stefan Grootscholten <stefan.grootscholten@gmail.com>
 * 
 * This gadget is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this gadget. If not, see <http://www.gnu.org/licenses/>. 
 * 
 * $Id: main.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */


/**
 * Constructor for the 24 seven FM Object
 */
function IR247fm()
{
	this.curstation = 0;
	this.defstation = 0;
	this.countdownActive = true;
	this.miniRadioActive = true;
	
	this.updatecheck = new UpdateCheck();
	this.language = new Language();
	this.miniRadio = new MiniPlayer();
	this.stations = [];
	this.spinnerInterval = null;
	this.stations[0] = new Station("24Seven.FM", "247", "247.png", "", "");
	this.stations[1] = new Station("Streaming Soundtracks.com", "SST", "sst.jpg", "http://www.streamingsoundtracks.com/", "http://loudcity.com/stations/streamingsoundtracks-com/files/show/");
	this.stations[2] = new Station("Death.FM", "DFM", "dfm.png", "http://death.fm/", "http://loudcity.com/stations/death-fm/files/show/");
	this.stations[3] = new Station("Entranced.FM", "EFM", "efm.jpg", "http://entranced.fm/", "http://loudcity.com/stations/entranced-fm/files/show/");
	this.stations[4] = new Station("1980s.FM", "80s", "80s.jpg", "http://1980s.fm/", "http://loudcity.com/stations/1980s-fm/files/show/");
	this.stations[5] = new Station("Adagio.FM", "AFM", "afm.jpg", "http://adagio.fm/", "http://loudcity.com/stations/adagio-fm/files/show/");
	
	System.Gadget.onUndock = this.undock;
	System.Gadget.onDock = this.dock;
	System.Gadget.Flyout.file = "flyout.html";
	System.Gadget.settingsUI = "settings.html";
	System.Gadget.onSettingsClosed = readSettings;
}

/**
 * Convert the station name to the station id
 * 
 * @param	string	naam
 * @return	int
 */
IR247fm.prototype.station2stationid = function (naam)
{
	for (var x = 1; x < this.stations.length; x++)
	{
		if (naam.toLowerCase() === this.stations[x].getShortname().toLowerCase())
		{
			return x;
		}
	}
	return 0;
};

/**
 * Set the background of the Gadget
 * 
 * @return	void
 */
IR247fm.prototype.setBackground = function ()
{
	this.stations[this.curstation].setBackground();
};

/**
 * Destruct the 24 seven FM Object
 * 
 * @return	void
 */
IR247fm.prototype.destruct = function ()
{
	if (this.spinnerInterval !== null)
	{
		clearInterval(this.spinnerInterval);
		this.spinnerInterval = null;
	}
	EventManager.CleanUp();
};

/**
 * Initialize the 24 seven FM Object
 * 
 * @return	void
 */
IR247fm.prototype.init = function ()
{
	document.getElementById("introText").innerHTML = this.language.introtext;
	document.getElementById("errorIcon").alt = this.language.infoIcon;
	if (this.spinnerInterval === null)
	{
		this.spinnerInterval = setInterval(function ()
		{
			var curHeight = parseInt(document.getElementById("busyIcon").style.backgroundPositionY, 10);
			if (isNaN(curHeight) || curHeight === "" || curHeight < 0)
			{
				curHeight = 288;
			}
			curHeight -= 16;
			document.getElementById("busyIcon").style.backgroundPositionY = curHeight;
		}, 30);
	}
	var mainObj = this;
	document.getElementById("minitabs").style.display = 'none';
	document.getElementById("updateenabled").style.display = 'none';
	
	this.miniRadio.setLanguage(this.language);
	this.initTabs();
	this.readSettings();
	
	EventManager.Add("tabopenlink", "mouseover", this.showMenu);
	EventManager.Add("minitabs", "mouseover", this.showMenu);
	EventManager.Add("minitabs", "mouseout", this.hideMenu);
	for (var x = 1; x < this.stations.length; x++)
	{
		this.stations[x].setLanguage(this.language);
		EventManager.Add("mtab_" + this.stations[x].getShortname().toLowerCase(), "click", function () {
			var e = window.event;
			e.cancelBubble = true;
			mainObj.setStation(mainObj.station2stationid(e.srcElement.id.substring(5)), false);
			e.returnValue = false;
		});
		EventManager.Add("btab_" + this.stations[x].getShortname().toLowerCase(), "click", function () {
			var e = window.event;
			e.cancelBubble = true;
			mainObj.setStation(mainObj.station2stationid(e.srcElement.id.substring(5)), false);
			e.returnValue = false;
		});
	}
	
	this.updatecheck.setLanguage(this.language);
	this.setStation(this.defstation, true);
	if (System.Gadget.docked) {
		this.dock();
	} else {
		this.undock();
	}
};

/**
 * Create the links to the stations in the tabs/menu
 * 
 * @return	void
 */
IR247fm.prototype.initTabs = function ()
{
	var total = this.stations.length - 1;
	var bightml = "";
	var minihtml = "";
	var percentage = parseInt(95 / total, 10);
	for (var x = 1; x < this.stations.length; x++)
	{
		minihtml += minihtml === "" ? "" : "<br />";
		minihtml += "<a href=\"#\" id=\"mtab_" + this.stations[x].getShortname().toLowerCase() + "\" class=\"tab_" + this.stations[x].getShortname().toLowerCase() + "\" title=\"" + this.stations[x].getStationName() + "\">" + this.stations[x].getShortname() + "</a>";
		bightml += "<div style=\"float: left; text-align: center; width: " + percentage + "%;\"><a href=\"#\" id=\"btab_" + this.stations[x].getShortname().toLowerCase() + "\" class=\"tab_" + this.stations[x].getShortname().toLowerCase() + "\" title=\"" + this.stations[x].getStationName() + "\">" + this.stations[x].getShortname() + "</a></div>";
	}
	document.getElementById("minitabs").innerHTML = minihtml;
	document.getElementById("bigtabs").innerHTML = bightml;
};

/**
 * Read the saved preferences
 * 
 * @return	void
 */
IR247fm.prototype.readSettings = function ()
{
	var defStation = parseInt(System.Gadget.Settings.readString("SettingsDefStation"), 10);
	if (!isNaN(defStation) && defStation !== 0) {
		this.defstation = defStation;
	}
	var countDownSetting = System.Gadget.Settings.readString("SettingsCountdown");
	if (countDownSetting !== "") {
		this.countdownActive = false;
		Countdown.getInstance().setActive(false);
	} else {
		this.countdownActive = true;
		if (this.curstation !== 0 && ! this.stations[this.curstation].isCommercial()) {
			Countdown.getInstance().setActive(true);
		}
	}
	var miniRadioSetting = System.Gadget.Settings.readString("SettingsMiniRadio");
	if (miniRadioSetting !== "") {
		this.miniRadioActive = false;
		this.miniRadio.setActive(false);
	} else {
		this.miniRadioActive = true;
		if (this.curstation !== 0) {
			this.miniRadio.setActive(true);
		}
	}
	var audioFormat = System.Gadget.Settings.readString("SettingsAudioFormat");
	for (var x = 0; x < this.stations.length; x++)
	{
		this.stations[x].setAudioformat(audioFormat);
	}
};

/**
 * Enable the station
 * 
 * Called from user interaction
 * 
 * @param	int		station
 * @param	boolean	init
 * @return	void
 */
IR247fm.prototype.setStation = function (station, init)
{
	if (station !== this.curstation || init)
	{
		document.getElementById("countdownTimer").innerHTML = "";
		System.Gadget.beginTransition();
		if (! init)
		{
			this.stations[this.curstation].disableStation();
		}
		this.curstation = station;
		this.stations[this.curstation].enableStation();
		if (this.curstation !== 0)
		{
			this.stations[this.curstation].getSOAPdata();
		}
		if (this.miniRadioActive && this.curstation !== 0)
		{
			this.miniRadio.setURL(this.stations[this.curstation].getAudioURL());
		}
		if (this.countdownActive && this.curstation !== 0)
		{
			Countdown.getInstance().setActive(true);
		}
		this.updatecheck.setFlyoutBackground(this.stations[this.curstation].getFlyoutBackground());
		this.updatecheck.setFlyoutClassName(this.stations[this.curstation].getFlyoutClassName());
		System.Gadget.endTransition(System.Gadget.TransitionType.morph, 1);
	}
};

/**
 * Show the menu with stations in the docked view
 * 
 * @return	void
 */
IR247fm.prototype.showMenu = function ()
{
	document.getElementById("minitabs").style.display = 'block';
	window.event.returnValue = false;
};

/**
 * Hide the menu with stations in the docked view
 * 
 * @return	void
 */
IR247fm.prototype.hideMenu = function ()
{
	document.getElementById("minitabs").style.display = 'none';
	window.event.returnValue = false;
};

/**
 * Change the view from undocked to docked
 * 
 * Called when the gadget is docked
 * 
 * @return	void
 */
IR247fm.prototype.dock = function ()
{
	document.getElementById("minibar").style.display = 'block';
	document.getElementById("bar1").className = "docked";
	document.getElementById("bar2").className = "docked";
	document.getElementById("content").className = "docked";
	document.getElementsByTagName("body")[0].style.width = '130px';
	document.getElementById("mainbackground").style.width = "100%";
	setGadgetBackground();
};

/**
 * Change the view from docked to undocked
 * 
 * Called when the gadget is undocked
 * 
 * @return	void
 */
IR247fm.prototype.undock = function ()
{
	document.getElementById("minibar").style.display = 'none';
	document.getElementById("bar1").className = "undocked";
	document.getElementById("bar2").className = "undocked";
	document.getElementById("content").className = "undocked";
	document.getElementsByTagName("body")[0].style.width = '300px';
	document.getElementById("mainbackground").style.width = "100%";
	setGadgetBackground();
};

IR247fm.prototype.station_getSoapData = function (id)
{
	this.stations[id].getSOAPdata();
};

/**
 * Other functions for interaction with setTimeout and body->onload
 */
var ir;

function init()
{
	ir = new IR247fm();
	ir.init();
}

function setGadgetBackground()
{
	ir.setBackground();
}

function readSettings()
{
	ir.readSettings();
}

function station_getSoapData(id)
{
	var num = ir.station2stationid(id);
	ir.station_getSoapData(num);
}