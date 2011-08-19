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
 * $Id: countdownObject.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */

/**
 * Constructor for the countdown object
 */
function CountDown()
{
	this.active = true;
	this.time = 0;
	this.cdInterval = null;
	this.cdTimer = null;
}

/**
 * Set the endtime to countdown to
 * 
 * @param	integer	time
 * @return	void
 */
CountDown.prototype.setEndtime = function (time)
{
	this.time = time;
};

/**
 * Set the countdown to active
 * 
 * @param	boolean	active
 * @return	void
 */
CountDown.prototype.setActive = function (active)
{
	this.active = active;
	if (! active)
	{
		document.getElementById("countdownTimer").innerHTML = "";
		if (this.cdInterval !== null)
		{
			clearInterval(this.cdInterval);
			this.cdInterval = null;
		}
	}
	else
	{
		if (this.cdInterval === null)
		{
			var cdObj = this;
			this.cdInterval = setInterval(
				function () {
					var now = new Date();
					var diff = parseInt((cdObj.time - now.getTime()) / 1000, 10);
					if (diff < 0 || ! cdObj.active)
					{
						document.getElementById("countdownTimer").innerHTML = "";
						if (! cdObj.active)
						{
							return;
						}
					}
					else
					{
						var hour = parseInt(diff / 3600, 10);
						var minute = parseInt((diff - 3600 * hour) / 60, 10);
						var second = diff - 3600 * hour - 60 * minute;
						document.getElementById("countdownTimer").innerHTML = (hour > 0 ? hour + ":" : "") + ((hour > 0 && minute < 10) ? "0" : "") + minute + ":" + (second < 10 ? "0" : "") + second;
					}
				}, 995);
		}
	}
};