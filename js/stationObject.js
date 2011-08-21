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
 * $Id: stationObject.js 14 2008-12-24 14:27:01Z stefan.grootscholten $
 */

var Station = (function() {
	var Station = function(name, code, logo, url, listenurl, id) {
		this.id = id;
		this.name = name;
		this.code = code;
		this.classVal = 'station' + code;
		this.backgroundImg = 'img/bg/small/' + code.toLowerCase() + '.png';
		this.backgroundImgLarge = 'img/bg/large/' + code.toLowerCase() + '.png';
		this.logo = '/img/logo/' + logo;
		this.url = url;
		this.audiourlWMPHd = listenurl + 'WMP-hd.asx';
		this.audiourlAACPlusLo = listenurl + 'aacPlus-lo.asx';
		this.nextUpdate = 0;
		this.listenercount = 0;
		this.active = false;
		this.commercial = false;
		this.flyout = false;
		this.album = '';
		this.artist = '';
		this.title = '';
		this.cover = this.logo;
		this.link = '';
		this.errorText = '';
		this.busyText = '';
	};
	
	return function(name, code, logo, url, listenurl, id) {
		return new Station(name, code, logo, url, listenurl, id);
	};
})();

var StationManager = (function() {
	/**
	 * Instance of the station manager
	 * 
	 * @var StationManager
	 */
	var instance;
	
	function init() {
		/**
		 * Defined stations
		 * 
		 * @var array
		 */
		var stations = [];
		
		/**
		 * The default audioformat
		 * 
		 * @var string
		 */
		var audioFormat;
		
		/**
		 * Instance of the language object
		 * 
		 * @var Language
		 */
		var language;
		
		return {
			/**
			 * Add a station to the manager
			 * 
			 * @param string name
			 * @param string code
			 * @param string logo
			 * @param string url
			 * @param string listenurl
			 */
			add: function(name, code, logo, url, listenurl) {
				var id = stations.length;
				stations[id] = new Station(name, code, logo, url, listenurl, id);
			},
			/**
			 * Initialize the tabs
			 */
			initTabs: function() {
				var total = stations.length - 1;
				// Initialize the HTML for the tabs
				var perc = parseInt(95 / total, 10);
				var bightml = minihtml = '';
				for (var x = 1; x < stations.length; x++) {
					bightml += '<div style="float: left; text-align: center; width: ' + perc + '%;"><a href="#" id="btab_' + stations[x].code.toLowerCase() + '" class="tab_' + stations[x].code.toLowerCase() + '" title="' + stations[x].name + '">' + stations[x].code + '</a></div>';
					minihtml += (minihtml !== '' ? '<br />' : '') + '<a href="#" id="mtab_' + stations[x].code.toLowerCase() + '" class="tab_' + stations[x].code.toLowerCase() + '" title="' + stations[x].name + '">' + stations[x].code + '</a>';
				}
				document.getElementById('bigtabs').innerHTML = bightml;
				document.getElementById('minitabs').innerHTML = minihtml;
				// Initialize the Events on the tabs.
				for (var x = 1; x < stations.length; x++) {
					EventManager.Add('mtab_' + stations[x].code.toLowerCase(), 'click', function () {
						var e = window.event;
						e.cancelBubble = true;
						var code = e.srcElement.id.substring(5);
						var station = StationManager.getInstance().getByCode(code);
						RadioGadget.getInstance().setStation(station.id);
						e.returnValue = false;
					});
					EventManager.Add('btab_' + stations[x].code.toLowerCase(), 'click', function () {
						var e = window.event;
						e.cancelBubble = true;
						var code = e.srcElement.id.substring(5);
						var station = StationManager.getInstance().getByCode(code);
						RadioGadget.getInstance().setStation(station.id);
						e.returnValue = false;
					});
				}
			},
			/**
			 * Get the active station
			 * 
			 * @return Station
			 */
			getActive: function() {
				for (var x = 0; x < stations.length; x++) {
					if (stations[x].active) {
						return stations[x];
					}
				}
				return null;
			},
			/**
			 * Get the station by code
			 * 
			 * @param string code
			 * 
			 * @return Station
			 */
			getByCode: function(code) {
				for (var x = 0; x < stations.length; x++) {
					if (stations[x].code.toLowerCase() === code.toLowerCase()) {
						return stations[x];
					}
				}
				return null;
			},
			/**
			 * Get the station by ID
			 * 
			 * @param integer id
			 * 
			 * @return Station
			 */
			getByID: function(id) {
				for (var x = 0; x < stations.length; x++) {
					if (stations[x].id === id) {
						return stations[x];
					}
				}
				return null;
			},
			/**
			 * Set the active state of a station
			 * 
			 * @param string code
			 */
			setActive: function(code) {
				var actSt = this.getActive();
				
				if (actSt !== null && actSt.code === code) {
					return;
				} else if (actSt !== null) {
					EventManager.Remove('miniLinks', 'click');
					EventManager.Remove('bigLinks', 'click');
					actSt.active = false;
				}
				
				var actSt = this.getByCode(code);
				
				actSt.active = true;
				
				Countdown.getInstance().setEndtime(actSt.nextUpdate);
				document.getElementById('cover').innerHTML = '<img src="' + actSt.logo + '" alt="' + actSt.name + '" width="40" height="40" />';
				
				System.Gadget.Flyout.show = false;
				actSt.flyout = false;
				
				this.setBackground();
				
				var minititle = document.getElementById('minititle');
				var bigtitle = document.getElementById('bigtitle');
				if (actSt.url === '') {
					minititle.innerHTML = actSt.code;
					bigtitle.innerHTML = actSt.name;
				} else {
					minititle.innerHTML = '<a href="#" id="miniLinks">' + actSt.code + '</a>';
					bigtitle.innerHTML = '<a href="#" id="bigLinks">' + actSt.name + '</a>';
					EventManager.Add('miniLinks', 'click', function () {
						var e = window.event;
						e.cancelBubble = true;
						StationManager.getInstance().openFlyout();
						e.returnValue = false;
					});
					EventManager.Add('bigLinks', 'click', function () {
						var e = window.event;
						e.cancelBubble = true;
						StationManager.getInstance().openFlyout();
						e.returnValue = false;
					});
				}
				
				this.formatView();
			},
			/**
			 * Check if a station is the active station
			 * 
			 * @param string code
			 * 
			 * @return boolean
			 */
			isActive: function(code) {
				var actSt = this.getActive();
				return actSt.code === code;
			},
			/**
			 * Set the language object
			 * 
			 * @param Language newLanguage
			 */
			setLanguage: function(newLanguage) {
				language = newLanguage;
			},
			/**
			 * Set the audio format
			 * 
			 * @param string format
			 */
			setAudioformat: function(format) {
				audioFormat = format;
			},
			/**
			 * Get the audio URL
			 * 
			 * @return string
			 */
			getAudioURL: function() {
				var actSt = this.getActive();
				if (audioFormat === 'Lo') {
					return actSt.audiourlAACPlusLo;
				}
				return actSt.audiourlWMPHd;
			},
			/**
			 * Set the background
			 */
			setBackground: function() {
				var actSt = this.getActive();
				var gbg = document.getElementById('mainbackground');
				gbg.className = actSt.classVal;
				
				if (System.Gadget.docked) {
					gbg.src = 'url(' + actSt.backgroundImg + ')';
				} else {
					gbg.src = 'url(' + actSt.backgroundImgLarge + ')';
				}
			},
			/**
			 * Format the flyout
			 */
			formatFlyout: function() {
				var actSt = this.getActive();
				actSt.flyout = true;
				var siteLinks = '<a href="' + actSt.url + '" title="' + language.visitHomepage + '">' + language.homepage + '</a><br />' +
					'<a href="' + actSt.url + 'modules.php?name=Queue_Played" title="' + language.viewQueue + '">' + language.queue + '</a><br />' +
					'<a href="' + actSt.url + 'modules.php?name=Requests" title="' + language.makeRequest + '">' + language.request + '</a><br />' +
					'<a href="' + actSt.url + 'modules.php?name=Forums" title="' + language.visitForums + '">' + language.forums + '</a><br />' +
					'<a href="' + actSt.url + 'modules.php?name=Donations" title="' + language.donations + '">' + language.donate + '</a><br />' +
					actSt.listenercount + ' <a href="' + actSt.url + 'modules.php?name=Listen" title="' + language.moreListen + '">' + language.listeners + '</a>';
				
				var doc = System.Gadget.Flyout.document;
				doc.getElementById('updatecontent').style.display = 'none';
				doc.getElementById('linkscontent').style.display = 'block';
				doc.getElementById('flyoutBackground').className = actSt.classVal;
				doc.getElementById('flyoutBackground').src = 'url(' + actSt.backgroundImg + ')';
				doc.getElementById('stationtitle').innerHTML = actSt.name;
				doc.getElementById('siteLinks').innerHTML = siteLinks;
			},
			/**
			 * Open the station flyout
			 */
			openFlyout: function() {
				var actSt = this.getActive();
				
				if (System.Gadget.Flyout.show) {
					if (actSt.flyout) {
						return;
					}
					System.Gadget.Flyout.show = false;
				}
				
				System.Gadget.Flyout.onShow = function() {
					StationManager.getInstance().formatFlyout();
				};
				System.Gadget.Flyout.onHide = function() {
					StationManager.getInstance().flyoutHidden();
				};
				System.Gadget.Flyout.show = true;
			},
			/**
			 * Function called when the flyout is hidden
			 */
			flyoutHidden: function() {
				var actSt = this.getActive();
				actSt.flyout = false;
			},
			/**
			 * Format the view
			 */
			formatView: function() {
				var actSt = this.getActive();
				if (actSt.album === 'Death.FM' || actSt.album == 'StationID') {
					actSt.album = 'StationID';
					actSt.commercial = true;
				}
				if (actSt.album !== '' && actSt.album !== 'StationID') {
					document.getElementById('albumtitle').style.display = 'block';
					if (actSt.link !== '') {
						document.getElementById('albumtitle').innerHTML = '<a href="' + actSt.link + '" title="' + actSt.album + '">' + actSt.album + '</a>';
					} else {
						document.getElementById('albumtitle').innerHTML = '<span title="' + actSt.album + '">' + actSt.album + '</span>';
					}
				} else {
					document.getElementById('albumtitle').style.display = 'none';
					document.getElementById('albumtitle').innerHTML = '';
				}
				
				if (actSt.artist !== '' && actSt.album !== 'StationID') {
					document.getElementById('artistname').style.display = 'block';
					document.getElementById('artistname').innerHTML = '<span title="' + actSt.artist + '">' + actSt.artist + '</span>';
				} else {
					document.getElementById('artistname').style.display = 'none';
					document.getElementById('artistname').innerHTML = '';
				}
				
				document.getElementById('busyText').innerHTML = actSt.busyText;
				document.getElementById('errorText').innerHTML = actSt.errorText;
				
				if (actSt.url !== '') {
					if (actSt.title !== '' && actSt.album !== 'StationID') {
						document.getElementById('tracktitle').innerHTML = '<span title="' + actSt.title + '">' + actSt.title + '</span>';
					} else if (actSt.album === 'StationID') {
						document.getElementById('tracktitle').innerHTML = language.musicWillReturn;
					} else {
						document.getElementById('tracktitle').innerHTML = '';
					}
				}
				if (actSt.cover !== '' && actSt.album !== 'StationID') {
					document.getElementById('cover').innerHTML = '<img src="' + actSt.cover + '" alt="' + actSt.album + '" width="40" height="40" />';
				} else {
					document.getElementById('cover').innerHTML = '<img src="' + actSt.logo + '" alt="' + actSt.name + '" width="40" height="40" />';
				}
				
				if (actSt.flyout && System.Gadget.Flyout.show) {
					this.formatFlyout();
				}
				
				if (actSt.url !== '') {
					document.getElementById('introview').style.display = 'none';
					document.getElementById('normalview').style.display = 'none';
					document.getElementById('busyview').style.display = 'none';
					document.getElementById('errorview').style.display = 'none';
					if (actSt.errorText !== '') {
						document.getElementById('errorview').style.display = 'block';
					} else if (actSt.busyText !== '') {
						document.getElementById('busyview').style.display = 'block';
					} else {
						document.getElementById('normalview').style.display = 'block';
					}
				}
			},
			/**
			 * Get new data from the SOAP server
			 */
			getData: function() {
				var actSt = this.getActive();
				var now = new Date();
				if (now.getTime() < actSt.nextUpdate) {
					var diff = (actSt.nextUpdate - now.getTime());
					if (diff < 5000) {
						setTimeout(function() {
								StationManager.getInstance().getData();
							},
							diff + 2000
						);
					}
					return;
				}
				actSt.album = '';
				actSt.artist = '';
				actSt.title = '';
				actSt.errorText = '';
				actSt.busyText = language.busyLoading;
				
				this.formatView();
				
				SoapClient.getInstance().getData(
					actSt.url + 'soap/FM24seven.php',
					'current',
					actSt.code,
					function(data) {
						StationManager.getInstance().handleSoapData(data);
					}
				);
			},
			/**
			 * Handler for the data from the soap client
			 * 
			 * @param Object data
			 */
			handleSoapData: function(data) {
				var actSt = this.getActive();
				
				var curSt = (actSt.code === data.station);
				var now = new Date();
				
				switch (data.status) {
				case 200:
					break;
					
				case 400:
					if (curSt) {
						// Try again
						setTimeout(function() {
								StationManager.getInstance().getData();
							},
							1000
						);
					}
					return;
					
				case 503:
					// Timeout
					if (curSt) {
						actSt.album = '';
						actSt.artist = '';
						actSt.title = '';
						actSt.errorText = language.serviceTimedOut;
						actSt.busyText = '';
						actSt.cover = '';
						actSt.link = '';
						actSt.commercial = true;
						
						this.formatView();
						
						setTimeout(function() {
								StationManager.getInstance().getData();
							},
							61500
						);
					}
					return;
					
				default:
					if (curSt) {
						actSt.artist = '';
						actSt.album = '';
						actSt.title = '';
						actSt.errorText = language.serviceNotAvailable;
						actSt.busyText = '';
						actSt.cover = '';
						actSt.commercial = true;
						actSt.link = '';
						this.formatView();
						setTimeout(function() {
								StationManager.getInstance().getData();
							},
							61500
						);
					}
					return;
				}
				if (! curSt) {
					actSt = this.getByCode(data.station);
				}
				
				var xml = data.data;
				
				actSt.commercial = false;
				var tracklength = 0;
				var systemTime = new Date();
				var playStart = new Date();
				
				if (xml.getElementsByTagName('Length').length !== 0 &&
						xml.getElementsByTagName('Length')[0].childNodes.length !== 0) {
					tracklength = parseInt(xml.getElementsByTagName('Length')[0].childNodes[0].nodeValue / 1000, 10);
				}
				if (xml.getElementsByTagName('PlayStart').length !== 0 &&
						xml.getElementsByTagName('PlayStart')[0].childNodes.length !== 0) {
					var playstartStr = xml.getElementsByTagName('PlayStart')[0].childNodes[0].nodeValue;
					playStart.setYear(parseInt(playstartStr.substring(0, 4), 10));
					playStart.setMonth(parseInt(playstartStr.substring(5, 7), 10) - 1);
					playStart.setDate(parseInt(playstartStr.substring(8, 10), 10));
					playStart.setHours(parseInt(playstartStr.substring(11, 13), 10));
					playStart.setMinutes(parseInt(playstartStr.substring(14, 16), 10));
					playStart.setSeconds(parseInt(playstartStr.substring(17, 19), 10));
				}
				if (xml.getElementsByTagName('SystemTime').length !== 0 &&
						xml.getElementsByTagName('SystemTime')[0].childNodes.length !== 0) {
					var systemTimeStr = xml.getElementsByTagName('SystemTime')[0].childNodes[0].nodeValue;
					systemTime.setYear(parseInt(systemTimeStr.substring(0, 4), 10));
					systemTime.setMonth(parseInt(systemTimeStr.substring(5, 7), 10) - 1);
					systemTime.setDate(parseInt(systemTimeStr.substring(8, 10), 10));
					systemTime.setHours(parseInt(systemTimeStr.substring(11, 13), 10));
					systemTime.setMinutes(parseInt(systemTimeStr.substring(14, 16), 10));
					systemTime.setSeconds(parseInt(systemTimeStr.substring(17, 19), 10));
				}
				var refresh = tracklength - parseInt((systemTime.getTime() - playStart.getTime()) / 1000, 10);
				
				if (refresh < -15) {
					actSt.album = 'StationID';
					actSt.commercial = true;
					refresh = 60;
				} else {
					if (refresh < 0) {
						refresh = 15;
						actSt.commercial = true;
					}
					if (xml.getElementsByTagName('SiteLink').length !== 0 &&
							xml.getElementsByTagName('SiteLink')[0].childNodes.length !== 0) {
						actSt.link = xml.getElementsByTagName('SiteLink')[0].childNodes[0].nodeValue;
					}
					if (xml.getElementsByTagName('Album').length !== 0 &&
							xml.getElementsByTagName('Album')[0].childNodes.length !== 0) {
						actSt.album = xml.getElementsByTagName('Album')[0].childNodes[0].nodeValue;
					}
					if (xml.getElementsByTagName('Track').length !== 0 &&
							xml.getElementsByTagName('Track')[0].childNodes.length !== 0) {
						actSt.title = xml.getElementsByTagName('Track')[0].childNodes[0].nodeValue;
					}
					if (xml.getElementsByTagName('Artist').length !== 0 &&
							xml.getElementsByTagName('Artist')[0].childNodes.length !== 0) {
						actSt.artist = xml.getElementsByTagName('Artist')[0].childNodes[0].nodeValue;
					}
					if (xml.getElementsByTagName('CoverLink').length !== 0 &&
							xml.getElementsByTagName('CoverLink')[0].childNodes.length !== 0) {
						var coverurl = xml.getElementsByTagName('CoverLink')[0].childNodes[0].nodeValue;
						actSt.cover = coverurl.replace(/cover\//, 'cover/040/');
					}
					if (xml.getElementsByTagName('ListenerCount').length !== 0 &&
							xml.getElementsByTagName('ListenerCount')[0].childNodes.length !== 0) {
						actSt.listenercount = parseInt(xml.getElementsByTagName('ListenerCount')[0].childNodes[0].nodeValue, 10);
					}
					actSt.errorText = '';
					actSt.busyText = '';
				}
				actSt.nextUpdate = now.getTime() + refresh * 1000;
				if (! curSt) {
					return;
				}
				this.formatView();
				if (! actSt.commercial) {
					Countdown.getInstance().setEndtime(actSt.nextUpdate);
				}
				
				setTimeout(function() {
						StationManager.getInstance().getData();
					},
					((actSt.nextUpdate - now.getTime()) + 2000)
				);
			}
		};
	}
	
	return {
		/**
		 * Get an instance of the StationMananger
		 * 
		 * @return StationManager
		 */
		getInstance: function() {
			if (! instance) {
				instance = init();
			}
			return instance;
		}
	};
})();
