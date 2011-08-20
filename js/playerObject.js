/**
 * Copyright (C) 2011 Stefan Grootscholten <stefan.grootscholten@gmail.com>
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
 * $Id: playerObject.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */


/**
 * Constructor for the MiniPlayer Object
 */
var MiniPlayer = (function() {
	/**
	 * Single instance of the MiniPlayer
	 * 
	 * @var MiniPlayer
	 */
	var instance;
	
	/**
	 * Init function
	 * 
	 * @return MiniPlayer
	 */
	function init() {
		/**
		 * HTML object reference to the Windows Media Player
		 * 
		 * @var Object
		 */
		var player = null;
		
		/**
		 * Language
		 * 
		 * @var Language
		 */
		var language = null;
		
		/**
		 * URL that is playing
		 * 
		 * @var string
		 */
		var playingURL = null;
		
		/**
		 * The URL of the active station
		 * 
		 * @var string
		 */
		var activeURL = null;
		
		/**
		 * Is the MiniPlayer playing
		 * 
		 * @var boolean
		 */
		var playing = false;
		
		/**
		 * Is the MiniPlayer muted
		 * 
		 * @var boolean
		 */
		var muted = false;
		
		/**
		 * Is the MiniPlayer active
		 * 
		 * @var boolean
		 */
		var active = false;
		
		return {
			/**
			 * Set the language and initiate the buttons
			 * 
			 * @param Language newlanguage
			 */
			setLanguage: function(newlanguage) {
				language = newlanguage;
				player = document.getElementById("WMPObject");
				
				document.getElementById('playdisabled').style.display = 'none';
				document.getElementById('stopenabled').style.display = 'none';
				document.getElementById('muteenabled').style.display = 'none';
				document.getElementById('radioButtons').style.display = 'none';
				document.getElementById('playenabled').innerHTML = '<a href="#" id="playButton"><img src="/img/play/enabled.png" width="13" height="13" alt="' + language.play + '" /></a>';
				document.getElementById('playdisabled').innerHTML = '<img src="/img/play/disabled.png" width="13" height="13" alt="" />';
				document.getElementById('stopenabled').innerHTML = '<a href="#" id="stopButton"><img src="/img/stop/enabled.png" width="13" height="13" alt="' + language.stop + '" /></a>';
				document.getElementById('stopdisabled').innerHTML = '<img src="/img/stop/disabled.png" width="13" height="13" alt="" />';
				document.getElementById('muteenabled').innerHTML = '<a href="#" id="muteButton"><img src="/img/mute/off.png" width="13" height="13" alt="' + language.mute + '" id="muteImage" /></a>';
				document.getElementById('mutedisabled').innerHTML = '<img src="/img/mute/disabled.png" width="13" height="13" alt="" />';
				
				player.attachEvent('playStateChange', function(newstate) {
					MiniPlayer.getInstance().playStateChanged(newstate);
				});
				EventManager.Add('playButton', 'click', function() {
					var e = window.event;
					e.cancelBubble = true;
					MiniPlayer.getInstance().play();
					e.returnValue = false;
				});
				EventManager.Add('stopButton', 'click', function() {
					var e = window.event;
					e.cancelBubble = true;
					MiniPlayer.getInstance().stop();
					e.returnValue = false;
				});
				EventManager.Add('muteButton', 'click', function() {
					var e = window.event;
					e.cancelBubble = true;
					MiniPlayer.getInstance().mute();
					e.returnValue = false;
				});
			},
			/**
			 * Enable or disable the MiniPlayer
			 * 
			 * @param boolean newactive
			 */
			setActive: function(newactive) {
				active = newactive;
				if (newactive) {
					document.getElementById('radioButtons').style.display = 'block';
				} else {
					document.getElementById('radioButtons').style.display = 'none';
					if (playing) {
						MiniPlayer.getInstance().stop();
					}
				}
			},
			/**
			 * Set the URL of the active station and update the button states
			 * 
			 * @param string url
			 */
			setURL: function(url) {
				MiniPlayer.getInstance().setActive(true);
				activeURL = url;
				
				if (playingURL === activeURL) {
					document.getElementById('playenabled').style.display = 'none';
					document.getElementById('playdisabled').style.display = 'block';
					document.getElementById('stopdisabled').style.display = 'none';
					document.getElementById('stopenabled').style.display = 'block';
				} else {
					document.getElementById('playdisabled').style.display = 'none';
					document.getElementById('playenabled').style.display = 'block';
					document.getElementById('stopenabled').style.display = 'none';
					document.getElementById('stopdisabled').style.display = 'block';
				}
				
				if (muted) {
					document.getElementById('muteImage').src = '/img/mute/on.png';
				} else {
					document.getElementById('muteImage').src = '/img/mute/off.png';
				}
				
				if (playingURL === '') {
					document.getElementById('muteenabled').style.display = 'none';
					document.getElementById('mutedisabled').style.display = 'block';
				}
			},
			/**
			 * Event handler for the playstate change event
			 * 
			 * @param integer newstate
			 */
			playStateChanged: function(newstate) {
				if (newstate === 1) {
					// Stream stopped playing
					document.getElementById('playdisabled').style.display = 'none';
					document.getElementById('playenabled').style.display = 'block';
					document.getElementById('stopenabled').style.display = 'none';
					document.getElementById('stopdisabled').style.display = 'block';
					document.getElementById('muteenabled').style.display = 'none';
					document.getElementById('mutedisabled').style.display = 'block';
				} else if (newstate === 3) {
					// Stream started playing
					document.getElementById('mutedisabled').style.display = 'none';
					document.getElementById('muteenabled').style.display = 'block';
					if (playingURL === activeURL) {
						// Active station is playing
						document.getElementById('playenabled').style.display = 'none';
						document.getElementById('playdisabled').style.display = 'block';
						document.getElementById('stopenabled').style.display = 'block';
						document.getElementById('stopdisabled').style.display = 'none';
					} else {
						// Active station is not playing
						document.getElementById('playdisabled').style.display = 'none';
						document.getElementById('playenabled').style.display = 'block';
						document.getElementById('stopenabled').style.display = 'none';
						document.getElementById('stopdisabled').style.display = 'block';
					}
					
					if (muted) {
						document.getElementById('muteImage').src = '/img/mute/on.png';
					} else {
						document.getElementById('muteImage').src = '/img/mute/off.png';
					}
					playing = true;
				} else if (newstate === 6){
					// Stream is buffering
				}
				// Other states:
				// 0 Undefined
				// 2 Paused
				// 4 ScanForward
				// 5 ScanReverse
				// 7 Waiting
				// 8 MediaEnded
				// 9 Transitioning
				// 10 Ready
				// 11 Reconnecting
			},
			/**
			 * Play the stream
			 */
			play: function() {
				if (! player.isOnline) {
					return;
				}
				
				if (playingURL === activeURL) {
					return;
				}
				
				if (playing) {
					MiniPlayer.getInstance().stop();
					MiniPlayer.getInstance().play();
				} else {
					player.URL = activeURL;
					player.Settings.volume = 100;
					playingURL = activeURL;
					player.controls.play();
					playing = true;
				}
			},
			/**
			 * Stop the stream
			 */
			stop: function() {
				if (playing) {
					player.controls.stop();
					playing = false;
					playingURL = '';
					player.Settings.mute = false;
					muted = false;
				}
			},
			/**
			 * Mute of unmute the stream
			 */
			mute: function() {
				if (playing) {
					if (muted) {
						document.getElementById('muteImage').src = '/img/mute/off.png';
						player.Settings.mute = false;
						muted = false;
					} else {
						document.getElementById('muteImage').src = '/img/mute/on.png';
						player.Settings.mute = true;
						muted = true;
					}
				}
			}
		};
	}
	
	return {
		/**
		 * Get the single instance of the MiniPlayer
		 * 
		 * @return MiniPlayer
		 */
		getInstance: function() {
			if (! instance) {
				instance = init();
			}
			return instance;
		}
	};
})();
