/*
 * EventManager.js
 * by Keith Gaughan
 *
 * This allows event handlers to be registered unobtrusively, and cleans
 * them up on unload to prevent memory leaks.
 *
 * Copyright (c) Keith Gaughan, 2005.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Common Public License v1.0
 * (CPL) which accompanies this distribution, and is available at
 * http://www.opensource.org/licenses/cpl.php
 *
 * This software is covered by a modified version of the Common Public License
 * (CPL), where Keith Gaughan is the Agreement Steward, and the licensing
 * agreement is covered by the laws of the Republic of Ireland.
 * 
 * Original: http://talideon.com/weblog/2005/03/js-memory-leaks.cfm
 * 
 * $Id: EventManager.js 6 2008-10-07 07:40:15Z stefan.grootscholten $
 */

var EventManager =
{
	registry: null,

	Initialise: function ()
	{
		if (this.registry === null)
		{
			this.registry = [];

			// Register the cleanup handler on page unload.
			EventManager.Add(window, "unload", this.CleanUp);
		}
	},

	/**
	 * Registers an event and handler with the manager.
	 *
	 * @param  obj		 Object handler will be attached to.
	 * @param  type		Name of event handler responds to.
	 * @param  fn		  Handler function.
	 * @param  useCapture  Use event capture. False by default.
	 *					 If you don't understand this, ignore it.
	 *
	 * @return True if handler registered, else false.
	 */
	Add: function (obj, type, fn, useCapture)
	{
		this.Initialise();

		// If a string was passed in, it's an id.
		if (typeof obj === "string")
		{
			obj = document.getElementById(obj);
		}
		if (obj === null || fn === null)
		{
			return false;
		}

		// Mozilla/W3C listeners?
		if (obj.addEventListener)
		{
			obj.addEventListener(type, fn, useCapture);
			this.registry.push({obj: obj, type: type, fn: fn, useCapture: useCapture});
			return true;
		}

		// IE-style listeners?
		if (obj.attachEvent && obj.attachEvent("on" + type, fn))
		{
			this.registry.push({obj: obj, type: type, fn: fn, useCapture: false});
			return true;
		}

		return false;
	},

	/**
	 * Unregisters an event and handler with the manager
	 * 
	 * @param  obj		 Object handler will be detached from.
	 * @param  type........Name of event handler.
	 * 
	 * @return True if handler unregistered, else false.
	 */
	Remove: function (mObj, mType)
	{
		// If a string was passed in, it's an id.
		if (typeof mObj === "string")
		{
			mObj = document.getElementById(mObj);
		}
		if (mObj === null)
		{
			return false;
		}
		
		for (var x = 0; x < this.registry.length; x++)
		{
			var reg = this.registry[x];
			if (reg.obj === mObj && reg.type === mType)
			{
				// Mozilla/W3C listeners?
				if (reg.obj.removeEventListener)
				{
					reg.obj.removeEventListener(reg.type, reg.fn, reg.useCapture);
				}
				// IE-style listeners?
				else if (reg.obj.detachEvent)
				{
					reg.obj.detachEvent("on" + reg.type, reg.fn);
				}
				this.registry.splice(x, 1);
			}
		}
		
		return false;
	},
	
	/**
	 * Cleans up all the registered event handlers.
	 */
	CleanUp: function ()
	{
		for (var i = 0; i < EventManager.registry.length; i++)
		{
			var reg = EventManager.registry[i];
			// Mozilla/W3C listeners?
			if (reg.obj.removeEventListener)
			{
				reg.obj.removeEventListener(reg.type, reg.fn, reg.useCapture);
			}
			// IE-style listeners?
			else if (reg.obj.detachEvent)
			{
				reg.obj.detachEvent("on" + reg.type, reg.fn);
			}
		}

		// Kill off the registry itself to get rid of the last remaining
		// references.
		EventManager.registry = null;
	}
};