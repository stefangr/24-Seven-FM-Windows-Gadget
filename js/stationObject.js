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
 * $Id: stationObject.js 14 2008-12-24 14:27:01Z stefan.grootscholten $
 */


/**
 * Constructor of the station Object
 */
function Station(name, shortname, logo, url, listenurl)
{
	this.classVal = "station" + shortname;
	this.name = name;
	this.shortname = shortname;
	this.logo = "/img/logo/" + logo;
	this.backgroundImg = "img/bg/small/" + shortname.toLowerCase() + ".png";
	this.backgroundImgLarge = "img/bg/large/" + shortname.toLowerCase() + ".png";
	this.audiourlWMP = listenurl + "WMP-lo.asx";
//	this.audiourlWMPHi = listenurl + "WMP-hi.asx";
	this.audiourlWMPHd = listenurl + "WMP-hd.asx";
	this.audiourlLo = listenurl + "aacPlus-lo.asx";
	this.audiourlHi = listenurl + "aacplus-hi.asx";
	this.url = url;
	this.nextUpdate = 0;
	this.listenercount = 0;
	this.active = false;
	this.language = null;
	this.countdown = null;
	this.trackTimer = null;
	this.timeoutTimer = null;
	this.album = "";
	this.artist = "";
	this.title = "";
	this.errorText = "";
	this.busyText = "";
	this.cover = this.logo;
	this.xmlHttp = null;
	
	this.audioformat = "";
	
	this.flyout = false;
}

/**
 * Set the audio format of the stream
 * 
 * @param	String	audioformat
 * @return	void
 */
Station.prototype.setAudioformat = function (audioformat)
{
	this.audioformat = audioformat;
};

/**
 * Set the language Object
 * 
 * @param	Language	language
 * @return	void
 */
Station.prototype.setLanguage = function (language)
{
	this.language = language;
};

/**
 * Set the countdown object
 * @param	Countdown	countdown
 * @return	void
 */
Station.prototype.setCountdown = function (countdown)
{
	this.countdown = countdown;
};

/**
 * Set the background of the Gadget
 * 
 * @return	void
 */
Station.prototype.setBackground = function ()
{
	var obg = document.getElementById("mainbackground");
	obg.className = this.classVal;
	if (System.Gadget.docked)
	{
		obg.src = "url(" + this.backgroundImg + ")";
	}
	else
	{
		obg.src = "url(" + this.backgroundImgLarge + ")";
	}
};

/**
 * Get the class of the Flyout
 * 
 * @return	String
 */
Station.prototype.getFlyoutClassName = function ()
{
	return this.classVal;
};

/**
 * Get the background of the Flyout
 * 
 * @return	String
 */
Station.prototype.getFlyoutBackground = function ()
{
	return this.backgroundImg;
};

/**
 * Enable the current radiostation
 * 
 * Changes the view to the current station
 * @return	void
 */
Station.prototype.enableStation = function ()
{
	var now = new Date();
	if (this.countdown !== null)
	{
		this.countdown.setEndtime(this.nextUpdate);
	}
	if (now.getTime() > this.nextUpdate)
	{
		document.getElementById("cover").innerHTML = "<img src=\"" + this.logo + "\" alt=\"" + this.name + "\" />";
	}
	System.Gadget.Flyout.show = false;
	this.flyout = false;
	this.active = true;
	this.setBackground();
	var minititle = document.getElementById("minititle");
	if (this.url === "")
	{
		minititle.innerText = this.shortname;
	}
	else
	{
		minititle.innerHTML = "<a href=\"#\" id=\"miniLinks\">" + this.shortname + "</a>";
	}
	var bigtitle = document.getElementById("bigtitle");
	if (this.url === "")
	{
		bigtitle.innerHTML = this.name;
	}
	else
	{
		bigtitle.innerHTML = "<a href=\"#\" id=\"bigLinks\">" + this.name + "</a>";
	}
	var logo = document.getElementById("cover");
	logo.innerHTML = "<img src=\"" + this.logo + "\" alt=\"" + this.name + "\" />";
	this.formatView();
	if (this.url !== "")
	{
		var stObj = this;
		EventManager.Add("miniLinks", "click", function () {
			var e = window.event;
			e.cancelBubble = true;
			stObj.openFlyout();
			e.returnValue = false;
		});
		EventManager.Add("bigLinks", "click", function () {
			var e = window.event;
			e.cancelBubble = true;
			stObj.openFlyout();
			e.returnValue = false;
		});
	}
};

/**
 * Open the station flyout
 * 
 * @return	void
 */
Station.prototype.openFlyout = function ()
{
	if (System.Gadget.Flyout.show)
	{
		if (this.flyout)
		{
			return;
		}
		System.Gadget.Flyout.show = false;
	}
	var stObj = this;
	System.Gadget.Flyout.onShow = function ()
	{
		stObj.formatFlyout();
	};
	System.Gadget.Flyout.onHide = function ()
	{
		stObj.flyout = false;
	};
	System.Gadget.Flyout.show = true;
};

/**
 * Format the station flyout
 * 
 * @return	void
 */
Station.prototype.formatFlyout = function ()
{
	this.flyout = true;
	var siteLinks = "<a href=\"" + this.url + "\" title=\"" + this.language.visitHomepage + "\">" + this.language.homepage + "</a><br /><a href=\"" + this.url + "modules.php?name=Queue_Played\" title=\"" + this.language.viewQueue + "\">" + this.language.queue + "</a><br /><a href=\"" + this.url + "modules.php?name=Requests\" title=\"" + this.language.makeRequest + "\">" + this.language.request + "</a><br /><a href=\"" + this.url + "modules.php?name=Forums\" title=\"" + this.language.visitForums + "\">" + this.language.forums + "</a><br /><a href=\"" + this.url + "modules.php?name=Donations\" title=\"" + this.language.donations + "\">" + this.language.donate + "</a><br />" + this.listenercount + " <a href=\"" + this.url + "modules.php?name=Listen\" title=\"" + this.language.moreListen + "\">" + this.language.listeners + "</a>";
	var doc = System.Gadget.Flyout.document;
	doc.getElementById("updatecontent").style.display = 'none';
	doc.getElementById("linkscontent").style.display = 'block';
	doc.getElementById("flyoutBackground").className = this.classVal;
	doc.getElementById("flyoutBackground").src = "url(" + this.backgroundImg + ")";
	doc.getElementById("stationtitle").innerHTML = this.name;
	doc.getElementById("siteLinks").innerHTML = siteLinks;
};

/**
 * Disable the current radiostation
 * 
 * @return	void
 */
Station.prototype.disableStation = function ()
{
	EventManager.Remove("miniLinks", "click");
	EventManager.Remove("bigLinks", "click");
	this.active = false;
};

/**
 * Get the short name of the station
 * 
 * @return	string
 */
Station.prototype.getShortname = function ()
{
	return this.shortname;
};

/**
 * Get the full name of the station
 * 
 * @return	string
 */
Station.prototype.getStationName = function ()
{
	return this.name;
};

/**
 * Get the audio URL for the station
 * 
 * @return	string
 */
Station.prototype.getAudioURL = function ()
{
	if (this.audioformat === "Lo")
	{
//		return this.audiourlLo;
		return this.audiourlWMP;
	}
	else if (this.audioformat === "Hi")
	{
//		return this.audiourlHi;
		return this.audiourlWMPHd;
	}
	else if (this.audioformat === "WMPHi")
	{
//		return this.audiourlWMPHi;
		return this.audiourlWMPHd;
	}
	else if (this.audioformat === "WMPHd")
	{
		return this.audiourlWMPHd;
	}
	return this.audiourlWMP;
};

/**
 * Check if the current track is a station ID
 * 
 * @return	boolean
 */
Station.prototype.isCommercial = function ()
{
	return this.commercial;
};

/**
 * Get the next update time
 * 
 * @return	integer
 */
Station.prototype.getNextUpdate = function ()
{
	return this.nextUpdate;
};

/**
 * Initialize the SOAP request
 * 
 * @return	void
 */
Station.prototype.getSOAPdata = function ()
{
	var now = new Date();
	if (now.getTime() < this.nextUpdate) {
		var diff = (this.nextUpdate - now.getTime());
		if (diff < 5000) {
			this.trackTimer = setTimeout(function () {
				station_getSoapData(this.shortname);
				return true;
			}, diff + 1000);
		}
		return;
	}
	if (this.timeoutTimer !== null)
	{
		clearTimeout(this.timeoutTimer);
		this.timeoutTimer = null;
	}
	if (!this.active)
	{
		return;
	}
	this.album = "";
	this.artist = "";
	this.title = "";
	this.errorText = "";
	this.busyText = this.language.busyLoading;
	this.formatView();
	if (this.xmlHttp === null)
	{
		this.xmlHttp = new XMLHttpRequest();
	}
	var stObj = this;
	var soapReq = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
		"<soap:Envelope " +
		"xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
		"xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" " +
		"xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
		"<soap:Body>" +
		"<GetCurrentlyPlaying xmlns=\"http://24seven.fm\">" +
		"<GetCover>false</GetCover>" +
		"</GetCurrentlyPlaying></soap:Body></soap:Envelope>";
	this.timeoutTimer = setTimeout(function () {
		stObj.xmlHttp.abort();
		var now = new Date();
		stObj.album = "";
		stObj.artist = "";
		stObj.title = "";
		stObj.errorText = stObj.language.serviceTimedOut;
		stObj.busyText = "";
		stObj.cover = "";
		stObj.commercial = true;
		stObj.formatView();
		stObj.trackTimer = setTimeout(function () {
			station_getSoapData(stObj.shortname);
			return true;
		}, 61500);
	}, 30000);
	try
	{
		this.xmlHttp.open("POST", this.url + "soap/FM24seven.php", true);
		this.xmlHttp.onreadystatechange = function ()
		{
			if (this.readyState !== 4)
			{
				return;
			}
			if (stObj.timeoutTimer !== null) {
				clearTimeout(stObj.timeoutTimer);
				stObj.timeoutTimer = null;
			}
			if (this.status !== 200)
			{
				stObj.artist = "";
				stObj.album = "";
				stObj.title = "";
				stObj.errorText = stObj.language.serviceNotAvailable;
				stObj.busyText = "";
				stObj.cover = "";
				stObj.nextUpdate = now.getTime() + 60000;
				stObj.commercial = true;
				stObj.trackTimer = setTimeout(function () {
					station_getSoapData(stObj.shortname);
					return true;
				}, 61500);
				stObj.formatView();
				return;
			}
			stObj.commercial = false;
			var xml = this.responseXML;
			var tracklength = 0;
			var systemTime = new Date();
			var playStart = new Date();
			if (xml.getElementsByTagName("Length").length !== 0 && xml.getElementsByTagName("Length")[0].childNodes.length !== 0)
			{
				tracklength = parseInt(xml.getElementsByTagName("Length")[0].childNodes[0].nodeValue / 1000, 10);
			}
			if (xml.getElementsByTagName("PlayStart").length !== 0 && xml.getElementsByTagName("PlayStart")[0].childNodes.length !== 0)
			{
				var playstartStr = xml.getElementsByTagName("PlayStart")[0].childNodes[0].nodeValue;
				playStart.setYear(parseInt(playstartStr.substring(0, 4), 10));
				playStart.setMonth(parseInt(playstartStr.substring(5, 7), 10) - 1);
				playStart.setDate(parseInt(playstartStr.substring(8, 10), 10));
				playStart.setHours(parseInt(playstartStr.substring(11, 13), 10));
				playStart.setMinutes(parseInt(playstartStr.substring(14, 16), 10));
				playStart.setSeconds(parseInt(playstartStr.substring(17, 19), 10));
			}
			if (xml.getElementsByTagName("SystemTime").length !== 0 && xml.getElementsByTagName("SystemTime")[0].childNodes.length !== 0)
			{
				var systimeStr = xml.getElementsByTagName("SystemTime")[0].childNodes[0].nodeValue;
				systemTime.setYear(parseInt(systimeStr.substring(0, 4), 10));
				systemTime.setMonth(parseInt(systimeStr.substring(5, 7), 10) - 1);
				systemTime.setDate(parseInt(systimeStr.substring(8, 10), 10));
				systemTime.setHours(parseInt(systimeStr.substring(11, 13), 10));
				systemTime.setMinutes(parseInt(systimeStr.substring(14, 16), 10));
				systemTime.setSeconds(parseInt(systimeStr.substring(17, 19), 10));
			}
			var refresh = tracklength - parseInt((systemTime.getTime() - playStart.getTime()) / 1000, 10);
			if (refresh < 0)
			{
				stObj.album = "StationID";
				stObj.commercial = true;
				refresh = 60;
			}
			else
			{
				if (xml.getElementsByTagName("Album").length !== 0 && xml.getElementsByTagName("Album")[0].childNodes.length !== 0) {
					stObj.album = xml.getElementsByTagName("Album")[0].childNodes[0].nodeValue;
				}
				if (xml.getElementsByTagName("Track").length !== 0 && xml.getElementsByTagName("Track")[0].childNodes.length !== 0) {
					stObj.title = xml.getElementsByTagName("Track")[0].childNodes[0].nodeValue;
				}
				if (xml.getElementsByTagName("Artist").length !== 0 && xml.getElementsByTagName("Artist")[0].childNodes.length !== 0) {
					stObj.artist = xml.getElementsByTagName("Artist")[0].childNodes[0].nodeValue;
				}
				if (xml.getElementsByTagName("CoverLink").length !== 0 && xml.getElementsByTagName("CoverLink")[0].childNodes.length !== 0) {
					var coverurl = xml.getElementsByTagName("CoverLink")[0].childNodes[0].nodeValue;
					stObj.cover = coverurl.replace(/cover\//, 'cover/040/');
				}
				if (xml.getElementsByTagName("ListenerCount").length !== 0 && xml.getElementsByTagName("ListenerCount")[0].childNodes.length !== 0) {
					stObj.listenercount = parseInt(xml.getElementsByTagName("ListenerCount")[0].childNodes[0].nodeValue, 10);
				}
				stObj.errorText = "";
				stObj.busyText = "";
			}
			stObj.formatView();
			stObj.nextUpdate = now.getTime() + refresh * 1000;
			if (! stObj.commercial)
			{
				stObj.countdown.setEndtime(stObj.nextUpdate);
			}
			stObj.trackTimer = setTimeout(function () {
				station_getSoapData(stObj.shortname);
				return true;
			}, ((stObj.nextUpdate - now.getTime()) + 2000));
		};
		this.xmlHttp.setRequestHeader("Content-type", "text/xml; charset=utf-8");
		this.xmlHttp.setRequestHeader("SOAPAction", "\"urn:xmethods-delayed-quotes#GetCurrentlyPlaying\"");
		this.xmlHttp.setRequestHeader("Content-length", soapReq.length);
		this.xmlHttp.send(soapReq);
	}
	catch (e)
	{
		clearTimeout(this.timeoutTimer);
		this.trackTimer = setTimeout(function () {
			stObj.getSOAPdata();
			return true;
		}, 1000);
	}
};

/**
 * Format the string to exclude HTML characters
 * 
 * @param	string	nw
 * @return	string
 */
Station.prototype.stripHTML = function (nw) {
	nw = nw.replace(/&amp;/gi, "&");
	nw = nw.replace(/&gt;/gi, ">");
	nw = nw.replace(/&lt;/gi, "<");
	nw = nw.replace(/&([a|e|i|o|u])uml;/gi, "$1");
	nw = nw.replace(/&([a|e|i|o|u])grave;/gi, "$1");
	nw = nw.replace(/&([a|e|i|o|u])acute;/gi, "$1");
	nw = nw.replace(/&([a|e|i|o|u])circ;/gi, "$1");
	nw = nw.replace(/&([a|e|i|o|u])tilde;/gi, "$1");
	nw = nw.replace(/&ccedil;/g, "c");
	return nw;
};

/**
 * Format the view of the gadget
 * 
 * @return	void
 */
Station.prototype.formatView = function ()
{
	if (this.album === "Death.FM" || this.album === "StationID")
	{
		this.album = "StationID";
		this.commercial = true;
	}
	if (this.album !== "" && this.album !== "StationID")
	{
		document.getElementById("albumtitle").style.display = 'block';
		document.getElementById("albumtitle").innerHTML = "<a href=\"http://www.amazon.com/exec/obidos/external-search/?mode=music&amp;tag=24fmll-20&amp;keyword=" + escape(this.stripHTML(this.album)) + "\" title=\"" + this.language.amazonAlbum + this.album + this.language.amazonLink + "\">" + this.album + "</a>";
	}
	else
	{
		document.getElementById("albumtitle").style.display = 'none';
		document.getElementById("albumtitle").innerHTML = "";
	}
	if (this.artist !== "" && this.album !== "StationID")
	{
		document.getElementById("artistname").style.display = 'block';
		document.getElementById("artistname").innerHTML = "<a href=\"http://www.amazon.com/exec/obidos/external-search/?mode=music&amp;tag=24fmll-20&amp;keyword=" + escape(this.stripHTML(this.artist)) + "\" title=\"" + this.language.amazonArtist + this.artist + this.language.amazonLink + "\">" + this.artist + "</a>";
	}
	else
	{
		document.getElementById("artistname").style.display = 'none';
		document.getElementById("artistname").innerHTML = "";
	}
	document.getElementById("busyText").innerHTML = this.busyText;
	document.getElementById("errorText").innerHTML = this.errorText;
	if (this.url !== "")
	{
		if (this.title !== "" && this.album !== "StationID")
		{
			document.getElementById("tracktitle").innerHTML = "<span title=\"" + this.title + "\">" + this.title + "</a>";
		}
		else if (this.album === "StationID")
		{
			document.getElementById("tracktitle").innerHTML = this.language.musicWillReturn;
		}
		else
		{
			document.getElementById("tracktitle").innerHTML = "";
		}
	}
	if (this.cover !== "" && this.album !== "StationID")
	{
		document.getElementById("cover").innerHTML = "<img src=\"" + this.cover + "\" alt=\"" + this.album + "\" width=\"40\" height=\"40\" />";
	}
	else
	{
		document.getElementById("cover").innerHTML = "<img src=\"" + this.logo + "\" alt=\"" + this.name + "\" />";
	}
	if (this.flyout && System.Gadget.Flyout.show)
	{
		this.formatFlyout();
	}
	if (this.url !== "")
	{
		document.getElementById("introview").style.display = 'none';
		document.getElementById("normalview").style.display = 'none';
		document.getElementById("busyview").style.display = 'none';
		document.getElementById("errorview").style.display = 'none';
		if (this.errorText !== "")
		{
			document.getElementById("errorview").style.display = 'block';
		}
		else if (this.busyText !== "")
		{
			document.getElementById("busyview").style.display = 'block';
		}
		else
		{
			document.getElementById("normalview").style.display = 'block';
		}
	}
};