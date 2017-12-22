/* eslint-disable no-extend-native */

// ES6 Promise polyfill
const es6Promise = require('es6-promise');

// ES6 Symbol polyfill, this polyfill is required to use for (a of b)
const Symbol = require('es6-symbol'); // do not include with /implement as this crashes in iOS9

if (window.Symbol == null) {
   window.Symbol = Symbol;
}

// enables Symbol.iterator on arrays
// this enables "for of" statements (babel transpiles that use use iterators)
if (!Array.prototype[Symbol.iterator]) {
   Object.defineProperty(Array.prototype, Symbol.iterator, {
      enumerable: false,
      value: function () {
         let nextIndex = 0;
         const array = this;
         return {
            next: function () {
               return nextIndex < array.length ?
                  { value: array[nextIndex++], done: false } :
                  { done: true };
            }
         }
      }
   });
}

/*
File with polyfills we use in this project
*/

es6Promise.polyfill(); // activates the polyfill


window.something = 'polyfills included correctly'

// Object.assign polyfill
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
   (function () {
      Object.assign = function (target) {
         // We must check against these specific cases.
         if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
         }

         var output = Object(target);
         for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
               for (var nextKey in source) {
                  if (source.hasOwnProperty(nextKey)) {
                     output[nextKey] = source[nextKey];
                  }
               }
            }
         }
         return output;
      };
   })();
}

// Array.find polyfill
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
   Object.defineProperty(Array.prototype, 'find', {
      enumerable: false,
      value: function (predicate) {
         if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
         }
         if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
         }
         var list = Object(this);
         // eslint-disable-next-line
         var length = list.length >>> 0;
         var thisArg = arguments[1];
         var value;

         for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
               return value;
            }
         }
         return undefined;
      }
   });
}

// Array.findIndex polyfill
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
if (!Array.prototype.findIndex) {
   Object.defineProperty(Array.prototype, 'findIndex', {
      enumerable: false,
      value: function (predicate) {
         // 1. Let O be ? ToObject(this value).
         if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
         }

         var o = Object(this);

         // 2. Let len be ? ToLength(? Get(O, "length")).
         var len = o.length >>> 0; // eslint-disable-line

         // 3. If IsCallable(predicate) is false, throw a TypeError exception.
         if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
         }

         // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
         var thisArg = arguments[1];

         // 5. Let k be 0.
         var k = 0;

         // 6. Repeat, while k < len
         while (k < len) {
            // a. Let Pk be ! ToString(k).
            // b. Let kValue be ? Get(O, Pk).
            // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
            // d. If testResult is true, return k.
            var kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
               return k;
            }
            // e. Increase k by 1.
            k++;
         }

         // 7. Return -1.
         return -1;
      }
   });
}

// The Number.isNaN() method determines whether the passed value is NaN. It is a more robust version of the original, global isNaN().
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
Number.isNaN = Number.isNaN || function (value) {
   return typeof value === 'number' && isNaN(value);
};
