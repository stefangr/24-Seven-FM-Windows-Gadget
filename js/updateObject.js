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
 * $Id: updateObject.js 14 2008-12-24 14:27:01Z stefan.grootscholten $
 */


/**
 * Constructor of the Update Object
 * 
 * @return	void
 */
function UpdateCheck()
{
	this.newversion = '0.0';
	this.version = System.Gadget.version;
	this.updateUrl = '';
	this.flyout = false;
	this.language = null;
	this.classVal = "";
	this.backgroundImg = "";
}

/**
 * Set the language Object
 * 
 * @param	Language	language
 * @return	void
 */
UpdateCheck.prototype.setLanguage = function (language)
{
	var updObj = this;
	this.language = language;
	document.getElementById("updateButton").title = this.language.updateAvailable;
	document.getElementById("updateImage").alt = this.language.updateAvailable;
	EventManager.Add("updateButton", "click", function () {
		var e = window.event;
		e.cancelBubble = true;
		updObj.openFlyout();
		e.returnValue = false;
	});
	this.checkForUpdates();
};

/**
 * Set the Flyout Background
 * 
 * @param	String	bg
 * @return	void
 */
UpdateCheck.prototype.setFlyoutBackground = function (bg)
{
	this.backgroundImg = bg;
};

/**
 * Set the flyout Classname
 * 
 * @param	String	className
 * @return	void
 */
UpdateCheck.prototype.setFlyoutClassName = function (className)
{
	this.classVal = className;
};

/**
 * Open the Update Flyout
 * 
 * @return	void
 */
UpdateCheck.prototype.openFlyout = function ()
{
	if (System.Gadget.Flyout.show)
	{
		if (this.flyout)
		{
			return;
		}
		System.Gadget.Flyout.show = false;
	}
	var updObj = this;
	System.Gadget.Flyout.onShow = function ()
	{
		updObj.formatFlyout();
	};
	System.Gadget.Flyout.onHide = function ()
	{
		updObj.flyout = false;
	};
	System.Gadget.Flyout.show = true;
};

/**
 * Format the update flyout
 * 
 * @return	void
 */
UpdateCheck.prototype.formatFlyout = function ()
{
	this.flyout = true;
	var doc = System.Gadget.Flyout.document;
	doc.getElementById("linkscontent").style.display = 'none';
	doc.getElementById("updatecontent").style.display = 'block';
	doc.getElementById("flyoutBackground").className = this.classVal;
	doc.getElementById("flyoutBackground").src = "url(" + this.backgroundImg + ")";
	doc.getElementById("updatetitle").innerHTML = this.language.updateAvailable;
	doc.getElementById("curversiontext").innerHTML = this.language.currentVersion;
	doc.getElementById("newversiontext").innerHTML = this.language.newVersion;
	doc.getElementById("newversionlink").innerHTML = this.language.infoAndDownload;
	doc.getElementById("newversionlink").href = this.updateUrl;
	doc.getElementById("newversion").innerHTML = this.newversion;
	doc.getElementById("curversion").innerHTML = this.version;
};

/**
 * Check the update XML
 * 
 * @return	void
 */
UpdateCheck.prototype.checkForUpdates = function ()
{
	var updateFrequency = System.Gadget.Settings.readString("SettingsUpdateCheck");
	var lastUpdate = parseInt(System.Gadget.Settings.readString("LastUpdateCheck"), 10);
	var updateTimeout = 0;
	switch (updateFrequency)
	{
	case "day":
		updateTimeout = 86400;
		break;
	case "week":
		updateTimeout = 604800;
		break;
	case "month":
		updateTimeout = 2419200;
		break;
	case "never":
		return;
	}
	var now = new Date();
	var time = now.getTime();
	if (time < (lastUpdate + updateTimeout))
	{
		return;
	}
	var updObj = this;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status !== 200) {
				return;
			}
			System.Gadget.Settings.writeString("LastUpdateCheck", time);
			if (this.overrideMimeType) {
				var xml = this.responseXML;
				var d = xml.getElementsByTagName("vistaSidebar");
				if (d.length === 0) {
					return;
				}
				if (d[0].getElementsByTagName("version").length === 0) {
					return;
				}
				updObj.newversion = d[0].getElementsByTagName("version")[0].innerHTML;
				if (parseFloat(updObj.version) > parseFloat(updObj.newversion)) {
					return;
				}
				updObj.updateUrl = d[0].getElementsByTagName("url")[0].childNodes[0].nodeValue;
			} else {
				var response = this.responseText;
				response = response.substring(response.indexOf("<vistaSidebar>") + 14, response.indexOf("</vistaSidebar>"));
				updObj.newversion = response.substring(response.indexOf("<version>") + 9, response.indexOf("</version>"));
				updObj.updateUrl = response.substring(response.indexOf("<url>") + 5, response.indexOf("</url>"));
				if (parseFloat(updObj.version) > parseFloat(updObj.newversion)) {
					return;
				}
			}
			if (updObj.updateUrl.indexOf("?") === -1) {
				updObj.updateUrl += "?ver=" + updObj.version + "&lang=" + updObj.language.langcode;
			} else {
				updObj.updateUrl += "&ver=" + updObj.version + "&lang=" + updObj.language.langcode;
			}
			document.getElementById("updatedisabled").style.display = 'none';
			document.getElementById("updateenabled").style.display = 'block';
			return;
		}
	};
	try
	{
		xhr.open("GET", "http://24seven-fm-gadgets.googlecode.com/files/24sevenfm_update.xml", "true");
		setTimeout(function () {
			xhr.abort();
			return;
		}, 30000);
		if (xhr.overrideMimeType) {
			xhr.overrideMimeType("text/xml");
		}
		xhr.send(null);
	}
	catch (e) {}
};
