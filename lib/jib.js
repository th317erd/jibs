import deadbeef from 'deadbeef';
import * as Utils from './utils.js';

export class Jib {
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

export const JIB_BARREN  = Symbol.for('@jibs.barren');
export const JIB_PROXY   = Symbol.for('@jibs.proxy');
export const JIB         = Symbol.for('@jibs.jib');

export function factory(JibClass) {
  return function $(_type, props = {}) {
    if (isJibish(_type))
      throw new TypeError('Received a jib but expected a component.');

    let Type = (_type == null) ? JIB_PROXY : _type;

    function barren(..._children) {
      let children = _children;

      function jib() {
        if (Utils.instanceOf(Type, 'promise') || children.some((child) => Utils.instanceOf(child, 'promise'))) {
          return Promise.all([ Type ].concat(children)).then((all) => {
            Type = all[0];
            children = all.slice(1);

            return new JibClass(
              Type,
              props,
              children,
            );
          });
        }

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

export const $ = factory(Jib);

export function isJibish(value) {
  if (typeof value === 'function' && (value[JIB_BARREN] || value[JIB]))
    return true;

  return false;
}

export function constructJib(value) {
  if (typeof value === 'function') {
    if (value[JIB_BARREN])
      return value()();
    else if (value[JIB])
      return value();
  }

  throw new TypeError('constructJib: Provided value is not a Jib.');
}
