/**
 * Copyright (C) 2008 - 2011 Stefan Grootscholten <stefan.grootscholten@gmail.com>
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

var Settings = (function() {
	/**
	 * Default station
	 * 
	 * @var integer
	 */
	var defaultstation = 0;
	
	/**
	 * Is miniradio enabled
	 * 
	 * @var boolean
	 */
	var miniradio = true;
	
	/**
	 * Is countdown clock enabled
	 * 
	 * @var boolean
	 */
	var countdownclock = true;
	
	/**
	 * Instance of the language
	 * 
	 * @var boolean
	 */
	var language = new Language();
	
	function readSettings() {
		var curStation = parseInt(System.Gadget.Settings.readString('SettingsDefStation'), 10);
		if (! isNaN(curStation) && curStation !== 0) {
			document.getElementById('DefStation').options[curStation].selected = true;
		}
		var countdown = System.Gadget.Settings.readString('SettingsCountdown');
		if (countdown !== '') {
			document.getElementById('countdown').checked = false;
		} else {
			document.getElementById('countdown').checked = true;
		}
		var miniRadio = System.Gadget.Settings.readString('SettingsMiniRadio');
		if (miniRadio !== '') {
			document.getElementById('miniRadio').checked = false;
			this.enableRadio(false);
		} else {
			document.getElementById('miniRadio').checked = true;
		}
		var audioFormat = System.Gadget.Settings.readString('SettingsAudioFormat');
		if (audioFormat === '') {
//			document.getElementById('formatWMP').checked = true;
			document.getElementById('formatWMPHd').checked = true;
		} else if (audioFormat === 'WMPHi') {
//			document.getElementById('formatWMPHi').checked = true;
			document.getElementById('formatWMPHd').checked = true;
		} else if (audioFormat === 'WMPHd') {
			document.getElementById('formatWMPHd').checked = true;
		} else if (audioFormat === 'Lo') {
			document.getElementById('formatLo').checked = true;
		} else if (audioFormat === 'Hi') {
//			document.getElementById('formatHi').checked = true;
			document.getElementById('formatWMPHd').checked = true;
		}
		var updateCheck = System.Gadget.Settings.readString('SettingsUpdateCheck');
		for (var x = 1; x < document.getElementById('frequency').options.length; x++) {
			if (document.getElementById('frequency').options[x].value === updateCheck) {
				document.getElementById('frequency').options[x].selected = true;
				break;
			}
		}
	}
	
	return {
		/**
		 * Enables the radio buttons for the streams
		 */
		enableRadio: function(enabled) {
//			document.getElementById('formatWMP').disabled = ! enabled;
//			document.getElementById('formatWMPHi').disabled = ! enabled;
			document.getElementById('formatWMPHd').disabled = ! enabled;
			document.getElementById('formatLo').disabled = ! enabled;
//			document.getElementById('formatHi').disabled = ! enabled;
		},
		/**
		 * Method called when the settings window is closed
		 */
		writeSettings: function(event) {
			if (event.closeAction !== event.Action.commit) {
				return;
			}
			var defStation = 0;
			if (document.getElementById('DefStation').selectedIndex !== 0) {
				defStation = document.getElementById('DefStation').selectedIndex;
			}
			System.Gadget.Settings.writeString('SettingsDefStation', defStation);
			var miniRadio = 'No';
			if (document.getElementById('miniRadio').checked) {
				miniRadio = '';
			}
			System.Gadget.Settings.writeString('SettingsMiniRadio', miniRadio);
			var countdown = 'No';
			if (document.getElementById('countdown').checked) {
				countdown = '';
			}
			System.Gadget.Settings.writeString('SettingsCountdown', countdown);
			var audioFormat = '';
			if (document.getElementById('formatLo').checked) {
				audioFormat = 'Lo';
//			} else if (document.getElementById('formatHi').checked) {
//				audioFormat = 'Hi';
//			} else if (document.getElementById('formatWMPHi').checked) {
//				audioFormat = 'WMPHi';
			} else if (document.getElementById('formatWMPHd').checked) {
				audioFormat = 'WMPHd';
			}
			System.Gadget.Settings.writeString('SettingsAudioFormat', audioFormat);
			var updateCheck = '';
			if (document.getElementById('frequency').selectedIndex !== 0) {
				updateCheck = document.getElementById('frequency').options[document.getElementById('frequency').selectedIndex].value;
			}
			System.Gadget.Settings.writeString('SettingsUpdateCheck', updateCheck);
		},
		/**
		 * Initialisation
		 */
		init: function() {
			document.getElementById('defStationTitle').innerHTML = language.defStationSelect;
			document.getElementById('DefStation').title = language.defStationSelect;
			document.getElementById('DefStation').options[0].innerHTML = language.noDefault;
			document.getElementById('miniRadioLabel').innerHTML = language.enableMiniradio;
			document.getElementById('miniradiotitle').title = language.enableMiniradio;
			document.getElementById('countdownLabel').innerHTML = language.enableCountdown;
			document.getElementById('countdowntitle').title = language.enableCountdown;
			document.getElementById('audioFormat').innerHTML = language.formatselect;
			document.getElementById('pluginText').innerHTML = language.pluginNeeded;
			document.getElementById('updateFrequency').innerHTML = language.updateTitle;
			document.getElementById('frequency').title = language.updateTitle;
			document.getElementById('updatestartup').innerHTML = language.updateAlways;
			document.getElementById('updateday').innerHTML = language.updateDay;
			document.getElementById('updateweek').innerHTML = language.updateWeek;
			document.getElementById('updatemonth').innerHTML = language.updateMonth;
			document.getElementById('updatenever').innerHTML = language.updateNever;
			
			System.Gadget.onSettingsClosing = function(event) {
				Settings.writeSettings(event)
			};
			
			document.getElementById('miniRadio').attachEvent('onclick', function() {
				if (document.getElementById('formatWMPHd').disabled) {
					Settings.enableRadio(true);
				} else {
					Settings.enableRadio(false);
				}
			});
			readSettings();
		}
	}
})();