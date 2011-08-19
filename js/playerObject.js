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
 * $Id: playerObject.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */


/**
 * Constructor for the MiniPlayer Object
 */
function MiniPlayer()
{
	this.player = null;
	this.language = null;
	this.playingURL = null;
	this.playing = false;
	this.muted = false;
	this.active = false;
}

/**
 * Set the language Object and initialize the MiniPlayer Object
 * 
 * @param	Language	language
 * @return	void
 */
MiniPlayer.prototype.setLanguage = function (language)
{
	this.language = language;
	this.player = document.getElementById("WMPObject");
	
	document.getElementById("playdisabled").style.display = 'none';
	document.getElementById("stopenabled").style.display = 'none';
	document.getElementById("muteenabled").style.display = 'none';
	document.getElementById("radioButtons").style.display = 'none';
	document.getElementById("playenabled").innerHTML = "<a href=\"#\" id=\"playButton\"><img src=\"/img/play/enabled.png\" width=\"13\" height=\"13\" alt=\"" + language.play + "\" /></a>";
	document.getElementById("playdisabled").innerHTML = "<img src=\"/img/play/disabled.png\" width=\"13\" height=\"13\" alt=\"\" />";
	document.getElementById("stopenabled").innerHTML = "<a href=\"#\" id=\"stopButton\"><img src=\"/img/stop/enabled.png\" width=\"13\" height=\"13\" alt=\"" + language.stop + "\" /></a>";
	document.getElementById("stopdisabled").innerHTML = "<img src=\"/img/stop/disabled.png\" width=\"13\" height=\"13\" alt=\"\" />";
	document.getElementById("muteenabled").innerHTML = "<a href=\"#\" id=\"muteButton\"><img src=\"/img/mute/off.png\" width=\"13\" height=\"13\" alt=\"" + language.mute + "\" id=\"muteImage\" /></a>";
	document.getElementById("mutedisabled").innerHTML = "<img src=\"/img/mute/disabled.png\" width=\"13\" height=\"13\" alt=\"\" />";

	var plObj = this;
	this.player.attachEvent('playStateChange', function (newstate)
	{
		plObj.playStateChanged(newstate);
	});
	EventManager.Add("playButton", "click", function () {
		var e = window.event;
		e.cancelBubble = true;
		plObj.play();
		e.returnValue = false;
	});
	EventManager.Add("stopButton", "click", function () {
		var e = window.event;
		e.cancelBubble = true;
		plObj.stop();
		e.returnValue = false;
	});
	EventManager.Add("muteButton", "click", function () {
		var e = window.event;
		e.cancelBubble = true;
		plObj.mute();
		e.returnValue = false;
	});
};

/**
 * (De)Activate the mini radio
 * 
 * @param	boolean	active
 * @return	void
 */
MiniPlayer.prototype.setActive = function (active)
{
	this.active = active;
	if (active)
	{
		document.getElementById("radioButtons").style.display = "block";
	}
	else
	{
		document.getElementById("radioButtons").style.display = "none";
		if (this.playing)
		{
			this.stop();
		}
	}
};

/**
 * Set the audio url of the active station
 * 
 * Change the view of the buttons
 * 
 * @param	string	url
 * @return	void
 */
MiniPlayer.prototype.setURL = function (url)
{
	this.setActive(true);
	this.url = url;
	if (this.playingURL === this.url)
	{
		document.getElementById("playenabled").style.display = "none";
		document.getElementById("playdisabled").style.display = "block";
		document.getElementById("stopdisabled").style.display = "none";
		document.getElementById("stopenabled").style.display = "block";
	}
	else
	{
		document.getElementById("playdisabled").style.display = "none";
		document.getElementById("playenabled").style.display = "block";
		document.getElementById("stopenabled").style.display = "none";
		document.getElementById("stopdisabled").style.display = "block";
	}
	if (this.muted)
	{
		document.getElementById("muteImage").src = "/img/mute/on.png";
	}
	else
	{
		document.getElementById("muteImage").src = "/img/mute/off.png";
	}
	if (this.playingURL === "")
	{
		document.getElementById("muteenabled").style.display = "none";
		document.getElementById("mutedisabled").style.display = "block";
	}
};

/**
 * Play the stream
 * 
 * @return	void
 */
MiniPlayer.prototype.play = function ()
{
	if (! this.player.isOnline)
	{
		return;
	}
	if (this.playingURL === this.url)
	{
		return;
	}
	if (this.playing)
	{
		this.stop();
		this.play();
	}
	else
	{
		this.player.URL = this.url;
		this.player.Settings.volume = 100;
		this.playingURL = this.url;
		this.playing = true;
	}
};

/**
 * Stop the playback of the stream
 * 
 * @return	void
 */
MiniPlayer.prototype.stop = function ()
{
	if (this.playing)
	{
		this.player.controls.stop();
		this.playing = false;
		this.playingURL = '';
		this.player.Settings.mute = false;
		this.muted = false;
	}
};

/**
 * Mute/Unmute the stream
 * 
 * @return	void
 */
MiniPlayer.prototype.mute = function ()
{
	if (this.playing)
	{
		if (this.muted) // Disable mute
		{
			document.getElementById("muteImage").src = "/img/mute/off.png";
			this.player.Settings.mute = false;
			this.muted = false;
		}
		else // Enable mute
		{
			document.getElementById("muteImage").src = "/img/mute/on.png";
			this.player.Settings.mute = true;
			this.muted = true;
		}
	}
};

/**
 * Event handler for the playstate change event
 * 
 * @param	int	newstate
 * @return	void
 */
MiniPlayer.prototype.playStateChanged = function (newstate)
{
	if (newstate === 1) // stopped
	{
		document.getElementById("playdisabled").style.display = "none";
		document.getElementById("playenabled").style.display = "block";
		document.getElementById("stopenabled").style.display = "none";
		document.getElementById("stopdisabled").style.display = "block";
		document.getElementById("muteenabled").style.display = "none";
		document.getElementById("mutedisabled").style.display = "block";
	}
	else if (newstate === 3)
	{
		document.getElementById("mutedisabled").style.display = "none";
		document.getElementById("muteenabled").style.display = "block";
		if (this.playingURL === this.url) // Visible station is playing
		{
			document.getElementById("playenabled").style.display = "none";
			document.getElementById("playdisabled").style.display = "block";
			document.getElementById("stopenabled").style.display = "block";
			document.getElementById("stopdisabled").style.display = "none";
		}
		else // Visible station is not playing
		{
			document.getElementById("playdisabled").style.display = "none";
			document.getElementById("playenabled").style.display = "block";
			document.getElementById("stopenabled").style.display = "none";
			document.getElementById("stopdisabled").style.display = "block";
		}
		if (this.muted)
		{
			document.getElementById("muteImage").src = "/img/mute/on.png";
		}
		else
		{
			document.getElementById("muteImage").src = "/img/mute/off.png";
		}
		this.playing = true;
	}
};
