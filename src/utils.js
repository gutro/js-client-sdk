var Base64 = require('Base64');

// See http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
function btoa(s) {
  return Base64.btoa(unescape(encodeURIComponent(s)));
}

function base64URLEncode(s) {
  return btoa(s)
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Events emmited in LDClient's initialize method will happen before the consumer
// can register a listener, so defer them to next tick.
function onNextTick(cb) {
  setTimeout(cb, 0);
}

// Based off of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
function merge(target, varArgs) { // .length of function is 2
  'use strict';
  
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}

/**
 * Wrap a promise to invoke an optional callback upon resolution or rejection.
 * 
 * This function assumes the callback follows the Node.js callback type: (err, value) => void
 * 
 * If a callback is provided:
 *   - if the promise is resolved, invoke the callback with (null, value)
 *   - if the promise is rejected, invoke the callback with (error, null)
 * 
 * @param {Promise<any>} promise 
 * @param {Function} callback 
 * @returns Promise<any>
 */
function wrapPromiseCallback(promise, callback) {
  return promise.then(
    function(value) {
      if (callback) {
        setTimeout(function() { callback(null, value); }, 0);
      }
      return value;
    },
    function(error) {
      if (callback) {
        setTimeout(function() { callback(error, null); }, 0);
      }
      return Promise.reject(error);
    }
  );
}

module.exports = {
  btoa: btoa,
  base64URLEncode: base64URLEncode,
  clone: clone,
  merge: merge,
  onNextTick: onNextTick,
  wrapPromiseCallback: wrapPromiseCallback
};
