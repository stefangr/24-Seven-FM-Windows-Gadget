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
 * $Id: settingsObject.js 14 2008-12-24 14:27:01Z stefan.grootscholten $
 */

/**
 * Constructor of the Settings Object
 */
function Settings()
{
	this.defaultstation = 0;
	this.miniradio = true;
	this.countdownclock = true;
	this.language = new Language();
	document.getElementById("defStationTitle").innerHTML = this.language.defStationSelect;
	document.getElementById("DefStation").title = this.language.defStationSelect;
	document.getElementById("DefStation").options[0].innerHTML = this.language.noDefault;
	document.getElementById("miniRadioLabel").innerHTML = this.language.enableMiniradio;
	document.getElementById("miniradiotitle").title = this.language.enableMiniradio;
	document.getElementById("countdownLabel").innerHTML = this.language.enableCountdown;
	document.getElementById("countdowntitle").title = this.language.enableCountdown;
	document.getElementById("audioFormat").innerHTML = this.language.formatselect;
//	document.getElementById("plugintext").innerHTML = this.language.pluginNeeded;
	document.getElementById("updateFrequency").innerHTML = this.language.updateTitle;
	document.getElementById("frequency").title = this.language.updateTitle;
	document.getElementById("updatestartup").innerHTML = this.language.updateAlways;
	document.getElementById("updateday").innerHTML = this.language.updateDay;
	document.getElementById("updateweek").innerHTML = this.language.updateWeek;
	document.getElementById("updatemonth").innerHTML = this.language.updateMonth;
	document.getElementById("updatenever").innerHTML = this.language.updateNever;
	System.Gadget.onSettingsClosing = this.writeSettings;
	var setObj = this;
	document.getElementById("miniRadio").attachEvent('onclick', function ()
	{
		if (document.getElementById("formatWMP").disabled)
		{
			setObj.enableRadio(true);
		}
		else
		{
			setObj.enableRadio(false);
		}
	});
	this.readSettings();
}

/**
 * Enable/Disable the radio stream selection
 * 
 * @param	Boolean	enabled
 * @return	void
 */
Settings.prototype.enableRadio = function (enabled)
{
	document.getElementById("formatWMP").disabled = ! enabled;
//	document.getElementById("formatWMPHi").disabled = ! enabled;
	document.getElementById("formatWMPHd").disabled = ! enabled;
//	document.getElementById("formatLo").disabled = ! enabled;
//	document.getElementById("formatHi").disabled = ! enabled;
};

/**
 * Read the settings and change the HTML
 * 
 * @return	void
 */
Settings.prototype.readSettings = function ()
{
	var curStation = parseInt(System.Gadget.Settings.readString("SettingsDefStation"), 10);
	if (! isNaN(curStation) && curStation !== 0) {
		document.getElementById("DefStation").options[curStation].selected = true;
	}
	var countdown = System.Gadget.Settings.readString("SettingsCountdown");
	if (countdown !== "") {
		document.getElementById("countdown").checked = false;
	} else {
		document.getElementById("countdown").checked = true;
	}
	var miniRadio = System.Gadget.Settings.readString("SettingsMiniRadio");
	if (miniRadio !== "") {
		document.getElementById("miniRadio").checked = false;
		this.enableRadio(false);
	} else {
		document.getElementById("miniRadio").checked = true;
	}
	var audioFormat = System.Gadget.Settings.readString("SettingsAudioFormat");
	if (audioFormat === "")
	{
		document.getElementById("formatWMP").checked = true;
	}
	else if (audioFormat === "WMPHi")
	{
//		document.getElementById("formatWMPHi").checked = true;
		document.getElementById("formatWMPHd").checked = true;
	}
	else if (audioFormat === "WMPHd")
	{
		document.getElementById("formatWMPHd").checked = true;
	}
	else if (audioFormat === "Lo")
	{
//		document.getElementById("formatLo").checked = true;
		document.getElementById("formatWMP").checked = true;
	}
	else if (audioFormat === "Hi")
	{
//		document.getElementById("formatHi").checked = true;
		document.getElementById("formatWMPHd").checked = true;
	}
	var updateCheck = System.Gadget.Settings.readString("SettingsUpdateCheck");
	for (var x = 1; x < document.getElementById("frequency").options.length; x++)
	{
		if (document.getElementById("frequency").options[x].value === updateCheck)
		{
			document.getElementById("frequency").options[x].selected = true;
			break;
		}
	}
};

/**
 * Read the settings from the HTML and write
 * 
 * @param	Event	event
 * @return	void
 */
Settings.prototype.writeSettings = function (event)
{
	if (event.closeAction === event.Action.commit) {
		var defStation = 0;
		if (document.getElementById("DefStation").selectedIndex !== 0) {
			defStation = document.getElementById("DefStation").selectedIndex;
		}
		System.Gadget.Settings.writeString("SettingsDefStation", defStation);
		var miniRadio = "No";
		if (document.getElementById("miniRadio").checked) {
			miniRadio = "";
		}
		System.Gadget.Settings.writeString("SettingsMiniRadio", miniRadio);
		var countdown = "No";
		if (document.getElementById("countdown").checked) {
			countdown = "";
		}
		System.Gadget.Settings.writeString("SettingsCountdown", countdown);
		var audioFormat = "";
//		if (document.getElementById("formatLo").checked)
//		{
//			audioFormat = "Lo";
//		}
//		else if (document.getElementById("formatHi").checked)
//		{
//			audioFormat = "Hi";
//		}
//		else if (document.getElementById("formatWMPHi").checked)
//		{
//			audioFormat = "WMPHi";
//		}
		/*else */if (document.getElementById("formatWMPHd").checked)
		{
			audioFormat = "WMPHd";
		}
		System.Gadget.Settings.writeString("SettingsAudioFormat", audioFormat);
		var updateCheck = "";
		if (document.getElementById("frequency").selectedIndex !== 0)
		{
			updateCheck = document.getElementById("frequency").options[document.getElementById("frequency").selectedIndex].value;
		}
		System.Gadget.Settings.writeString("SettingsUpdateCheck", updateCheck);
	}
};