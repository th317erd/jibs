import deadbeef from 'deadbeef';
import * as Utils from './utils.js';

export class Jib {
  constructor(Type, props, children) {
    let defaultProps = (Type && Type.props) ? Type.props : {};

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
        value:        { [JIB_CHILD_INDEX_PROP]: 0, ...defaultProps, ...(props || {}) },
      },
      'children': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        Utils.flattenArray(children),
      },
    });
  }
}

export const JIB_BARREN           = Symbol.for('@jibs.barren');
export const JIB_PROXY            = Symbol.for('@jibs.proxy');
export const JIB_RAW_TEXT         = Symbol.for('@jibs.rawText');
export const JIB                  = Symbol.for('@jibs.jib');
export const JIB_CHILD_INDEX_PROP = Symbol.for('@jibs.childIndexProp');

export function factory(JibClass) {
  function $(_type, props = {}) {
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
  }

  Object.defineProperties($, {
    'remap': {
      writable:     false,
      enumerable:   false,
      configurable: false,
      value:        (_jib, callback) => {
        let jib = _jib;
        if (jib == null || Object.is(jib, Infinity) || Object.is(jib, NaN))
          return jib;

        if (isJibish(jib))
          jib = constructJib(jib);

        const finalizeMap = (_mappedJib) => {
          let mappedJib = _mappedJib;

          if (isJibish(mappedJib))
            mappedJib = constructJib(mappedJib);
          else
            return mappedJib;

          return $(mappedJib.Type, mappedJib.props)(...(mappedJib.children || []));
        };

        let mappedJib = callback(jib);
        if (Utils.instanceOf(mappedJib, 'promise'))
          return mappedJib.then(finalizeMap);

        return finalizeMap(mappedJib);
      },
    },
  });

  return $;
}

export const $ = factory(Jib);

export function isJibish(value) {
  if (typeof value === 'function' && (value[JIB_BARREN] || value[JIB]))
    return true;

  if (value instanceof Jib)
    return true;

  return false;
}

export function constructJib(value) {
  if (value instanceof Jib)
    return value;

  if (typeof value === 'function') {
    if (value[JIB_BARREN])
      return value()();
    else if (value[JIB])
      return value();
  }

  throw new TypeError('constructJib: Provided value is not a Jib.');
}

export async function resolveChildren(_children) {
  let children = _children;

  if (Utils.instanceOf(children, 'promise'))
    children = await children;

  if (!((this.isIterableChild || Utils.isIterableChild).call(this, children)) && (isJibish(children) || ((this.isValidChild || Utils.isValidChild).call(this, children))))
    children = [ children ];

  let promises = Utils.iterate(children, async ({ value: _child }) => {
    let child = (Utils.instanceOf(_child, 'promise')) ? await _child : _child;

    if (isJibish(child))
      return await constructJib(child);
    else
      return child;
  });

  return await Promise.all(promises);
}
