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
 * $Id: updateObject.js 14 2008-12-24 14:27:01Z stefan.grootscholten $
 */

var UpdateCheck = (function() {
	/**
	 * Instane of the UpdateCheck
	 * 
	 * @var UpdateCheck
	 */
	var instance;
	
	/**
	 * Initialisation function
	 * 
	 * @return UpdateCheck
	 */
	function init() {
		/**
		 * Newly available version
		 * 
		 * @var string
		 */
		var newversion = '0.0';
		
		/**
		 * Current version
		 * 
		 * @var string
		 */
		var curversion = '0.0';
		
		/**
		 * Update URL
		 * 
		 * @var string
		 */
		var updateUrl;
		
		/**
		 * Is the flyout window shown
		 * 
		 * @var boolean
		 */
		var flyout = false;
		
		/**
		 * The language object
		 * 
		 * @var Object
		 */
		var language = null;
		
		/**
		 * Class value
		 * 
		 * @var string
		 */
		var classVal = '';
		
		/**
		 * Location of the background image
		 * 
		 * @var string
		 */
		var backgroundImg = '';
		
		/**
		 * Check the update XML
		 */
		function checkForUpdates() {
			var updateFrequency = System.Gadget.Settings.readString('SettingsUpdateCheck');
			var lastUpdate = parseInt(System.Gadget.Settings.readString('LastUpdateCheck'), 10);
			
			var updateTimeout = 0;
			switch (updateFrequency) {
			case 'day':
				updateTimeout = 86400;
				break;
				
			case 'week':
				updateTimeout = 604800;
				break;
				
			case 'month':
				updateTimeout = 2419200;
				break;
				
			case 'never':
				return;
			}
			
			var now = new Date();
			var time = now.getTime();
			if (time < (lastUpdate + updateTimeout)) {
				return;
			}
			
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status !== 200) {
						// HTTP State is not OK
						xhr.onreadystatechange = null;
						return;
					}
					System.Gadget.Settings.writeString('LastUpdateCheck', time);
					if (this.overrideMimeType) {
						UpdateCheck.getInstance().parseXML(this.responseXML);
					} else {
						UpdateCheck.getInstance().parseText(this.responseText);
					}
					xhr.onreadystatechange = null;
				}
			};
			try {
				xhr.open('GET', 'http://24seven-fm-gadgets.googlecode.com/svn/trunk/24sevenfm_update.xml', true);
				// Try 30 seconds to get the resource
				setTimeout(function() {
						xhr.abort();
					},
					30000
				);
				if (xhr.overrideMimeType) {
					// Resource is served as text/plain
					xhr.overrideMimeType('text/xml');
				}
				xhr.send(null);
			} catch (e) {
				xhr.onreadystatechange = null;
			}
		}
		
		/**
		 * Set the new language
		 * 
		 * @param Object newLanguage
		 */
		function setNewLanguage(newLanguage) {
			language = newLanguage;
			curversion = System.Gadget.version;
			checkForUpdates();
		}
		
		/**
		 * Enable the update button
		 */
		function enableUpdate() {
			document.getElementById('updateButton').title = language.updateAvailable;
			document.getElementById('updateImage').alt = language.updateAvailable;
			
			EventManager.Add('updateButton', 'click', function() {
				var e = window.event;
				e.cancelBubble = true;
				UpdateCheck.getInstance().openFlyout();
				e.returnValue = false;
			});
			
			if (updateUrl.indexOf('?') === -1) {
				updateUrl += '?';
			} else {
				updateUrl += '&';
			}
			
			updateUrl += 'utm_source=update_' + language.name + '&amp;utm_medium=gadget&amp;utm_campaign=24sevenfmGadget&amp;utm_content=' + curversion;
			document.getElementById('updatedisabled').style.display = 'none';
			document.getElementById('updateenabled').style.display = 'block';
		}
		
		return {
			/**
			 * Set the language
			 * 
			 * @param Object newlanguage
			 */
			setLanguage: function(newlanguage) {
				setNewLanguage(newlanguage);
			},
			/**
			 * Set the location of the flyout background image
			 * 
			 * @param string bgImage
			 */
			setFlyoutBackground: function(bgImage) {
				backgroundImg = bgImage;
			},
			/**
			 * Set the classname for the flyout
			 * 
			 * @param string className
			 */
			setFlyoutClassName: function(className) {
				classVal = className;
			},
			/**
			 * Open or close the Flyout
			 */
			openFlyout: function() {
				if (System.Gadget.Flyout.show) {
					if (UpdateCheck.getInstance().isFlyoutVisible()) {
						return;
					}
					System.Gadget.Flyout.show = false;
				}
				System.Gadget.Flyout.onShow = function() {
					UpdateCheck.getInstance().formatFlyout();
				};
				System.Gadget.Flyout.onHide = function() {
					UpdateCheck.getInstance().flyoutHidden();
				};
				System.Gadget.Flyout.show = true;
			},
			/**
			 * Is the flyout visible
			 * 
			 * @return boolean
			 */
			isFlyoutVisible: function() {
				return flyout;
			},
			/**
			 * Set the flyout to be hidden
			 */
			flyoutHidden: function() {
				flyout = false;
			},
			/**
			 * Show the flyout
			 */
			formatFlyout: function() {
				flyout = true;
				var doc = System.Gadget.Flyout.document;
				doc.getElementById('linkscontent').style.display = 'none';
				doc.getElementById('queuecontent').style.display = 'none';
				doc.getElementById('updatecontent').style.display = 'block';
				doc.getElementById('flyoutBackground').className = classVal;
				doc.getElementById('flyoutBackground').src = 'url(' + backgroundImg + ')';
				doc.getElementById('updatetitle').innerHTML = language.updateAvailable;
				doc.getElementById('curversiontext').innerHTML = language.currentVersion;
				doc.getElementById('newversiontext').innerHTML = language.newVersion;
				doc.getElementById('newversionlink').innerHTML = language.infoAndDownload;
				doc.getElementById('newversionlink').href = updateUrl;
				doc.getElementById('newversion').innerHTML = newversion;
				doc.getElementById('curversion').innerHTML = curversion;
			},
			/**
			 * Parse the XML
			 * 
			 * @param DomNode xml
			 */
			parseXML: function(xml) {
				var d = xml.getElementsByTagName('vistaSidebar');
				if (d.length === 0) {
					return;
				}
				if (d[0].getElementsByTagName('version').length === 0) {
					return;
				}
				newversion = d[0].getElementsByTagName('version')[0].innerHTML;
				if (parseFloat(curversion) >= parseFloat(newversion)) {
					return;
				}
				updateUrl = d[0].getElementsByTagName('url')[0].childNodes[0].nodeValue;
				enableUpdate();
			},
			/**
			 * Parse the text
			 * 
			 * @param string response
			 */
			parseText: function(response) {
				response = response.substring(
					response.indexOf('<vistaSidebar>') + 14,
					response.indexOf('</vistaSidebar>')
				);
				newversion = response.substring(
					response.indexOf('<version>') + 9,
					response.indexOf('</version>')
				);
				updateUrl = response.substring(
					response.indexOf('<url>') + 5,
					response.indexOf('</url>')
				);
				if (parseFloat(curversion) >= parseFloat(newversion)) {
					return;
				}
				enableUpdate();
			}
		};
	}
	
	return {
		/**
		 * Get the single instance of the Update Check
		 * 
		 * @return UpdateCheck
		 */
		getInstance: function() {
			if (! instance) {
				instance = init();
			}
			return instance;
		}
	};
})();
