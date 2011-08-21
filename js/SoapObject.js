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
 */

var SoapClient = (function() {
	/**
	 * Instance of the SoapClient
	 * 
	 * @var SoapClient
	 */
	var instance;
	
	/**
	 * Initialize the Soap Client
	 * 
	 * @return SoapClient
	 */
	function init() {
		/**
		 * Instance of XMLHttpRequest
		 * 
		 * @var XMLHttpRequest
		 */
		var xmlHTTP;
		
		/**
		 * Timeout ID for the Soap Request
		 * 
		 * @var integer
		 */
		var xmlTimeout = null;
		
		/**
		 * Get the SOAP action header
		 * 
		 * @param string action
		 * 
		 * @return string
		 */
		function getSoapAction(action) {
			switch (action) {
			case 'history':
				return 'urn:xmethods-delayed-quotes#GetHistory';
				
			case 'queue':
				return 'urn:xmethods-delayed-quotes#GetQueue';
				
			case 'current':
			default:
				return '"urn:xmethods-delayed-quotes#GetCurrentlyPlaying"'
			}
		}
		
		/**
		 * Get the SOAP body
		 * 
		 * @param string action
		 * 
		 * @return string
		 */
		function getBody(action) {
			switch (action) {
			case 'history':
				return '<GetHistory xmlns="http://24seven.fm"><NoOfEntries>3</NoOfEntries><GetCover>false</GetCover></GetHistory>';
				
			case 'queue':
				return '<GetQueue xmlns="http://24seven.fm"><NoOfEntries>3</NoOfEntries><GetCover>false</GetCover></GetQueue>';
				
			case 'current':
			default:
				return '<GetCurrentlyPlaying xmlns="http://24seven.fm"><GetCover>false</GetCover></GetCurrentlyPlaying>';
			}
		}
		
		/**
		 * Get the SOAP envelope
		 * 
		 * @param string body
		 * 
		 * @return string
		 */
		function getEnvelope(body) {
			return '<?xml version="1.0" encoding="utf-8"?>' +
				'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
				'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
				'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
				'<soap:Body>' + body + '</soap:Body></soap:Envelope>';
		}
		
		/**
		 * Perform the SOAP request
		 * 
		 * @param string url
		 * @param string action
		 * @param function callback
		 */
		function performSoapRequest(url, action, code, callback) {
			var body = getBody(action);
			var soapAction = getSoapAction(action);
			var envelope = getEnvelope(body);
			
			if (! xmlHTTP) {
				xmlHTTP = new XMLHttpRequest();
			} else if (null !== xmlTimeout) {
				xmlHTTP.abort();
				clearTimeout(xmlTimeout);
				xmlHTTP.onreadystatechange = null;
			}
			
			xmlHTTP.onreadystatechange = function() {
				if (this.readyState !== 4) {
					return;
				}
				
				if (null !== xmlTimeout) {
					clearTimeout(xmlTimeout);
					xmlTimeout = null;
				}
				
				if (this.status != 200) {
					callback({status: this.status, station: code});
				} else {
					var xml = this.responseXML;
					callback({status: 200, station: code, data: xml});
				}
				xmlHTTP.onreadystatechange = null;
			};
			
			try {
				xmlHTTP.open('POST', url, true);
				// Try for 30 seconds
				xmlTimeout = setTimeout(function() {
						xmlHTTP.abort();
						callback({status: 503, station: code});
					},
					30000
				);
				xmlHTTP.setRequestHeader('Content-type', 'text/xml; charset=utf-8');
				xmlHTTP.setRequestHeader('SOAPAction', soapAction);
				xmlHTTP.setRequestHeader('Content-length', envelope.length);
				xmlHTTP.send(envelope);
			} catch (e) {
				xmlHTTP.onreadystatechange = null;
				clearTimeout(xmlTimeout);
				callback({status: 400, station: code});
			}
		}
		
		return {
			/**
			 * Get the data from the SOAP server
			 * 
			 * @param string url
			 * @param string action
			 * @param string code
			 * @param function callback
			 */
			getData: function(url, action, code, callback) {
				performSoapRequest(url, action, code, callback);
			}
		}
	}
	
	return {
		/**
		 * Get the instance of the SoapClient
		 * 
		 * @return SoapClient
		 */
		getInstance: function() {
			if (! instance) {
				instance = init();
			}
			return instance;
		}
	}
})();
//
//SoapClient.getInstance().getData(
//	'http://www.streamingsoundtracks.com/soap/FM24seven.php',
//	'history',
//	function(data) {
//		console.log(data.status);
//		if (data.status === 200) {
//			console.log(data.data.xml);
//		}
//	}
//);
