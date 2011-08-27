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
 * $Id: main.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */

var RadioGadget = (function() {
	/**
	 * Instance of the Radio Gadget
	 * 
	 * @var RadioGadget
	 */
	var instance = null;
	
	function init() {
		/**
		 * The station that is active
		 * 
		 * @var integer
		 */
		var curstation = 0;
		
		/**
		 * The default station (from the settings)
		 * 
		 * @var integer
		 */
		var defstation = 0;
		
		/**
		 * Is the countdown active (settings)
		 * 
		 * @var boolean
		 */
		var countdownActive = true;
		
		/**
		 * Is the miniRadio active (settings)
		 */
		var miniRadioActive = true;
		
		/**
		 * The current language
		 * 
		 * @var Language
		 */
		var language = null;
		
		/**
		 * Interval ID
		 * 
		 * @var integer
		 */
		var spinnerInterval = null;
		
		/**
		 * Read the settings
		 */
		function readNewSettings() {
			var defStation = parseInt(System.Gadget.Settings.readString('SettingsDefStation'), 10);
			if (! isNaN(defStation) && defStation !== 0) {
				defstation = defStation;
			}
			
			var countDownSetting = System.Gadget.Settings.readString('SettingsCountdown');
			if (countDownSetting !== '') {
				countdownActive = false;
				Countdown.getInstance().setActive(false);
			} else {
				countdownActive = true;
				if (curstation !== 0 && ! StationManager.getInstance().getActive().commercial) {
					Countdown.getInstance().setActive(true);
				}
			}
			var miniRadioSetting = System.Gadget.Settings.readString('SettingsMiniRadio');
			if (miniRadioSetting !== '') {
				miniRadioActive = false;
				MiniPlayer.getInstance().setActive(false);
			} else {
				miniRadioActive = true;
				if (curstation !== 0) {
					MiniPlayer.getInstance().setActive(true);
				}
			}
			var audioFormat = System.Gadget.Settings.readString('SettingsAudioFormat');
			StationManager.getInstance().setAudioformat(audioFormat);
		}
		
		/**
		 * Set the new station
		 * 
		 * @param integer station_id
		 * @param boolean init
		 */
		function setNewStation(station, init) {
			if (station !== curstation || init) {
				document.getElementById('countdownTimer').innerHTML = '';
				System.Gadget.beginTransition();
				curstation = station;
				var stationManager = StationManager.getInstance();
				var newStation = stationManager.getByID(curstation);
				
				stationManager.setActive(newStation.code);
				
				if (curstation !== 0) {
					stationManager.getData();
					if (miniRadioActive) {
						MiniPlayer.getInstance().setURL(stationManager.getAudioURL());
					}
					if (countdownActive && ! newStation.commercial) {
						Countdown.getInstance().setActive(true);
					}
				}
				UpdateCheck.getInstance().setFlyoutBackground(newStation.backgroundImg);
				UpdateCheck.getInstance().setFlyoutClassName(newStation.classVal);
				System.Gadget.endTransition(System.Gadget.TransitionType.morph, 1);
			}
		}
		
		/**
		 * Initialize the gadget
		 */
		function initGadget() {
			language = new Language();
			System.Gadget.onUndock = function() {
				RadioGadget.getInstance().undock();
			};
			System.Gadget.onDock = function() {
				RadioGadget.getInstance().dock();
			};
			System.Gadget.Flyout.file = 'flyout.html';
			System.Gadget.settingsUI = 'settings.html';
			System.Gadget.onSettingsClosed = function() {
				RadioGadget.getInstance().readSettings();
			};
//			System.Gadget.visibilityChanged = RadioGadget.getInstance().changeVisibility();
			
			document.getElementById('introText').innerHTML = language.introtext;
			document.getElementById('errorIcon').alt = language.infoIcon;
			
			if (spinnerInterval === null) {
				spinnerInterval = setInterval(function() {
						var curHeight = parseInt(document.getElementById('busyIcon').style.backgroundPositionY, 10);
						if (isNaN(curHeight) || curHeight === '' || curHeight < 0) {
							curHeight = 288;
						}
						curHeight -= 16;
						document.getElementById('busyIcon').style.backgroundPositionY = curHeight;
					},
					30
				);
			}
			
			document.getElementById('minitabs').style.display = 'none';
			document.getElementById('updateenabled').style.display = 'none';
			
			UpdateCheck.getInstance().setLanguage(language);
			MiniPlayer.getInstance().setLanguage(language);
			var stationManager = StationManager.getInstance();
			stationManager.setLanguage(language);
			
			stationManager.add('24Seven.FM', '247', '247.png', '', '');
			stationManager.add('Streaming Soundtracks.com', 'SST', 'sst.jpg', 'http://www.streamingsoundtracks.com/', 'http://loudcity.com/stations/streamingsoundtracks-com/files/show/');
			stationManager.add('Death.FM', 'DFM', 'dfm.png', 'http://death.fm/', 'http://loudcity.com/stations/death-fm/files/show/');
			stationManager.add('Entranced.FM', 'EFM', 'efm.jpg', 'http://entranced.fm/', 'http://loudcity.com/stations/entranced-fm/files/show/');
			stationManager.add('1980s.FM', '80s', '80s.jpg', 'http://1980s.fm/', 'http://loudcity.com/stations/1980s-fm/files/show/');
			stationManager.add('Adagio.FM', 'AFM', 'afm.jpg', 'http://adagio.fm/', 'http://loudcity.com/stations/adagio-fm/files/show/');
			stationManager.initTabs();
			
			readNewSettings();
			
			EventManager.Add('tabopenlink', 'mouseover', function() {
				RadioGadget.getInstance().showMenu();
			});
			EventManager.Add('minitabs', 'mouseover', function() {
				RadioGadget.getInstance().showMenu();
			});
			EventManager.Add('minitabs', 'mouseout', function() {
				RadioGadget.getInstance().hideMenu();
			});
			
			setNewStation(defstation, true);
			if (System.Gadget.docked) {
				RadioGadget.getInstance().dock();
			} else {
				RadioGadget.getInstance().undock();
			}
		}
		
		return {
			/**
			 * Function called on dock event
			 */
			dock: function() {
				document.getElementById('mainwrapper').className = 'docked';
				document.getElementsByTagName('body')[0].style.width = '130px';
				document.getElementById('mainbackground').style.width = '100%';
				StationManager.getInstance().dock();
			},
			/**
			 * Function called on undock event
			 */
			undock: function() {
				document.getElementById('mainwrapper').className = 'undocked';
				document.getElementsByTagName('body')[0].style.width = '300px';
				document.getElementById('mainbackground').style.width = '100%';
				StationManager.getInstance().undock();
			},
			/**
			 * Function to read the (new) settings
			 */
			readSettings: function() {
				readNewSettings();
			},
			/**
			 * Function to show the menu
			 */
			showMenu: function() {
				document.getElementById('minitabs').style.display = 'block';
				window.event.returnValue = false;
			},
			/**
			 * Function to hide the menu
			 */
			hideMenu: function() {
				document.getElementById('minitabs').style.display = 'none';
				window.event.returnValue = false;
			},
			/**
			 * Set the station as active
			 * 
			 * @param integer station_id
			 * @param boolean init
			 */
			setStation: function(station_id) {
				setNewStation(station_id, false);
			},
			/**
			 * Bootstrap method
			 */
			bootstrap: function() {
				initGadget();
			}
		};
	}
	
	return {
		/**
		 * Get the instance of the Radio Gadget
		 * 
		 * @return RadioGadget
		 */
		getInstance: function() {
			if (instance === null) {
				instance = init();
			}
			return instance;
		}
	};
})();

function init() {
	RadioGadget.getInstance().bootstrap();
}
