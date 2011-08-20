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
 * $Id: countdownObject.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */

var Countdown = (function() {
	/**
	 * Instance of a Countdown
	 * 
	 * @var Countdown
	 */
	var instance;
	
	/**
	 * Initialize the Countdown
	 * 
	 * @return Countdown
	 */
	function init() {
		/**
		 * Is the countdown active
		 * 
		 * @var boolean
		 */
		var active = true;
		
		/**
		 * End time of the countdown
		 * 
		 * @var integer
		 */
		var time = 0;
		
		/**
		 * Interval ID
		 * 
		 * @var integer
		 */
		var cdInterval = null;
		
		/**
		 * Activate/Deactivate the countdown timer
		 * 
		 * @param boolean newactive
		 */
		function activate(newactive) {
			active = newactive;
			if (! newactive) {
				document.getElementById('countdownTimer').innerHTML = '';
				if (cdInterval !== null) {
					clearInterval(cdInterval);
					cdInterval = null
				}
			} else {
				if (cdInterval === null) {
					cdInterval = setInterval(
						function() {
							var now = new Date();
							var diff = parseInt((Countdown.getInstance().getTime() - now.getTime()) / 1000, 10);
							if (diff < 0 || ! Countdown.getInstance().getActive()) {
								document.getElementById('countdownTimer').innerHTML = '';
								if (! Countdown.getInstance().getActive()) {
									return;
								}
							} else {
								var hour = parseInt(diff / 3600, 10);
								var minute = parseInt((diff - 3600 * hour) / 60, 10);
								var second = diff - 3600 * hour - 60 * minute;
								document.getElementById('countdownTimer').innerHTML = (hour > 0 ? hour + ':' : '') + ((hour > 0 && minute < 10) ? '0' : '') + minute + ':' + (second < 10 ? '0' : '') + second;
							}
						},
						995
					);
				}
			}
		}
		/**
		 * Return public functions and variables
		 */
		return {
			/**
			 * Set the new end time
			 * 
			 * @param integer newtime
			 */
			setEndtime: function(newtime) {
				time = newtime;
			},
			/**
			 * Get the currently set time
			 * 
			 * @return integer
			 */
			getTime: function() {
				return time;
			},
			/**
			 * Enable/Disable the Countdown
			 * 
			 * @param boolean active
			 */
			setActive: function(newactive) {
				activate(newactive);
			},
			/**
			 * Return the activity state
			 * 
			 * @return boolean
			 */
			getActive: function() {
				return active;
			}
		}
	}
	
	return {
		/**
		 * Get the single instance of Countdown
		 * 
		 * @return Countdown
		 */
		getInstance: function() {
			if (! instance) {
				instance = init();
			}
			return instance;
		}
	}
})();
