'use strict';

const deadbeef = require('deadbeef');

class Jib {
  constructor(Type, props, children) {
    Object.defineProperties(this, {
      'Type': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        Type,
      },
      'props': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        props,
      },
      'children': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        children,
      },
    });
  }
}

const JIB_BARREN  = Symbol.for('@jibs.barren');
const JIB_PROXY   = Symbol.for('@jibs.proxy');
const JIB         = Symbol.for('@jibs.jib');

function factory(JibClass) {
  return function $(_type, props = {}) {
    if (isJibish(_type))
      throw new TypeError('Received a jib but expected a component.');

    let Type = (_type == null) ? JIB_PROXY : _type;

    function barren(...children) {
      function jib() {
        return new JibClass(
          Type,
          props,
          children,
        );
      }

      Object.defineProperties(jib, {
        [JIB]: {
          writable:     false,
          enumerable:   false,
          configurable: false,
          value:        true,
        },
        [deadbeef.idSym]: {
          writable:     false,
          enumerable:   false,
          configurable: false,
          value:        () => Type,
        },
      });

      return jib;
    }

    Object.defineProperties(barren, {
      [JIB_BARREN]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        true,
      },
      [deadbeef.idSym]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        () => Type,
      },
    });

    return barren;
  };
}

const $ = factory(Jib);

function isJibish(value) {
  if (typeof value === 'function' && (value[JIB_BARREN] || value[JIB]))
    return true;

  return false;
}

function constructJib(value) {
  if (typeof value === 'function') {
    if (value[JIB_BARREN])
      return value()();
    else if (value[JIB])
      return value();
  }

  throw new TypeError('constructJib: Provided value is not a Jib.');
}

module.exports = {
  JIB_BARREN,
  JIB_PROXY,
  JIB,
  Jib,
  factory,
  $,
  isJibish,
  constructJib,
};
