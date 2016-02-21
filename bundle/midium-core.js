(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _midium = require('./midium');

var _midium2 = _interopRequireDefault(_midium);

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.assign(_midium2.default, Utils);

global.Midium = _midium2.default;
exports.default = _midium2.default;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./midium":2,"./utils":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Midium = function () {
	/**
  * Constructor for a port colletion.
  *
  * @param {array} ports
  *
  * @returns {*}
  */

	function Midium(ports) {
		_classCallCheck(this, Midium);

		this.eventListeners = [];
		this.ports = [];

		for (var i = 0; i < ports.length; i++) {
			this.add(ports[i]);
		}
	}

	/**
  * Calls back when the MIDI driver is ready.
  *
  * @param {function} callback    Calls when the MIDI connection is ready.
  * @param {function} errorCallback
  *
  * @returns {void}
  */


	_createClass(Midium, [{
		key: 'add',


		/**
   * Adds MIDI port to the collection.
   *
   * @param {object} port    MIDI port
   *
   * @returns {object} Reference of this for method chaining.
   */
		value: function add(port) {
			port.onstatechange = this._onStateChange.bind(this);
			port.onmidimessage = this._onMIDIMessage.bind(this);
			this.ports.push(port);

			return this;
		}

		/**
   * Removes the references from the selected MIDI ports.
   *
   * @returns {void}
   */

	}, {
		key: 'removeReferences',
		value: function removeReferences() {
			this.ports.forEach(function (port) {
				port.onmidimessage = null;
				port.onstatechange = null;
			});
		}

		/**
   * Sends raw MIDI data.
   *
   * @param {number|array} message    24 bit byte array or integer
   *
   * @returns {object} Reference of this for method chaining.
   */

	}, {
		key: 'send',
		value: function send(message) {
			message = Midium.intToByteArray(message);

			this.ports.forEach(function (port) {
				if (port.type === 'output') {
					port.send(message);
				}
			});

			return this;
		}

		/**
   * Register an event listener.
   *
   * @param {number|array} event    24 bit byte array or integer
   * @param {number|array} mask     24 bit byte array or integer
   * @param {function} callback
   *
   * @returns {object} Returns with the reference of the event listener.
   */

	}, {
		key: 'addEventListener',
		value: function addEventListener(event, mask, callback) {
			this.eventListeners.push({
				event: Midium.byteArrayToInt(event),
				mask: Midium.byteArrayToInt(mask),
				reference: Midium.listenerCounter,
				callback: callback
			});

			return Midium.listenerCounter++;
		}

		/**
   * Removes the given event listener or event listeners.
   *
   * @param {number|array} references    Event listener references.
   *
   * @returns {void}
   */

	}, {
		key: 'removeEventListener',
		value: function removeEventListener(references) {
			Array.prototype.concat(references).forEach(function (reference) {
				this.eventListeners.forEach(function (listener, index) {
					if (listener.reference === reference) {
						this.eventListeners.splice(index, 1);
					}
				}, this);
			}, this);
		}

		/**
   * MIDI message event handler.
   *
   * @param {object} event    MIDI event data.
   *
   * @returns {void}
   */

	}, {
		key: '_onMIDIMessage',
		value: function _onMIDIMessage(event) {
			var data = Midium.byteArrayToInt(event.data);
			this.eventListeners.forEach(function (listener) {
				if ((data & listener.mask) === listener.event) {
					listener.callback(event);
				}
			}, this);
		}

		/**
   * State change event handler.
   *
   * @param {object} event    State change event data.
   *
   * @returns {void}
   */

	}, {
		key: '_onStateChange',
		value: function _onStateChange(event) {
			console.log('state', event);
		}
	}], [{
		key: 'ready',
		value: function ready(callback, errorCallback) {
			if (Midium.isReady) {
				callback();
			}

			navigator.requestMIDIAccess({
				sysex: false
			}).then(

			/* MIDI access granted */
			function (midiAccess) {
				Midium.isReady = true;
				Midium.midiAccess = midiAccess;
				callback();
			},

			/* MIDI access denied */
			function (error) {
				Midium.isReady = false;
				if (errorCallback) {
					errorCallback(error);
				}
			});
		}
	}, {
		key: 'select',
		value: function select(selector) {
			if (!Midium.isReady) {
				return [];
			}

			var ports = [];

			/* If the query is a MIDIInput or output. */
			if (selector instanceof window.MIDIOutput || selector instanceof window.MIDIInput) {
				ports[0] = selector;
			} else if (typeof selector === 'number' && Midium.midiAccess.inputs.has(query)) {
				ports[0] = Midium.midiAccess.inputs.get(query);
			} else if (typeof query === 'number' && Midium.midiAccess.outputs.has(query)) {
				ports[0] = Midium.midiAccess.outputs.get(query);
			} else if (selector instanceof Array) {
				selector.forEach(function (item) {
					ports.push(Midium.select(item)[0]);
				});
			} else if (typeof selector === 'string' || selector instanceof window.RegExp) {
				var name = '';

				Midium.midiAccess.inputs.forEach(function each(port) {
					name = port.name + ' ' + port.manufacturer;
					if (new RegExp(selector, 'i').test(name)) {
						ports.push(port);
					}
				});

				Midium.midiAccess.outputs.forEach(function each(port) {
					name = port.name + ' ' + port.manufacturer;
					if (new RegExp(selector, 'i').test(name)) {
						ports.push(port);
					}
				});
			}

			return new Midium(ports);
		}
	}]);

	return Midium;
}();

Midium.midiAccess = null;
Midium.isReady = false;
Midium.listenerCounter = 0;

exports.default = Midium;
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.byteArrayToInt = byteArrayToInt;
exports.intToByteArray = intToByteArray;
/**
 * Converts byte array to 24 bit integer.
 *
 * @param {number|array} byteArray    Byte array
 *
 * @returns {void}
 */
function byteArrayToInt(byteArray) {
  if (typeof byteArray === 'number') {
    return byteArray;
  }

  return byteArray[0] * 0x10000 + byteArray[1] * 0x100 + byteArray[2];
};

/**
 * Converts 24 bit integer to byte array.
 *
 * @param {number|array} int    24 bit integer
 *
 * @returns {void}
 */
function intToByteArray(int) {
  if (typeof int === 'array') {
    return int;
  }

  return [int >> 16, int >> 8 & 0x00ff, int & 0x0000ff];
};
},{}]},{},[1,2,3]);