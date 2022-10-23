'use strict';

import * as Utils from '../utils.js';

export const CONTEXT_ID = Symbol.for('@jibs/node/contextID');

export class RootNode {
  static CONTEXT_ID = CONTEXT_ID;

  constructor(renderer, parent, _context) {
    let context = renderer.createContext(
      _context,
      (this.onContextUpdate) ? this.onContextUpdate.bind(this) : undefined,
    );

    Object.defineProperties(this, {
      'renderer': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        renderer,
      },
      'parent': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parent,
      },
      'context': {
        enumerable:   false,
        configurable: true,
        get:          () => {
          return context;
        },
        set:          () => {},
      },
      'currentChildIndex': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        0,
      },
    });
  }

  destroy() {
    this.context = null;
  }

  isValidChild(child) {
    if (child == null)
      return false;

    if (typeof child === 'boolean')
      return false;

    if (Object.is(child, Infinity))
      return false;

    if (Object.is(child, NaN))
      return false;

    return true;
  }

  isIterableChild(child) {
    if (child == null || Object.is(child, NaN) || Object.is(child, Infinity))
      return false;

    return (Array.isArray(child) || typeof child === 'object' && !Utils.instanceOf(child, 'boolean', 'number', 'string'));
  }

  propsDiffer(oldProps, newProps, skipKeys) {
    return Utils.propsDiffer(oldProps, newProps, skipKeys);
  }

  childrenDiffer(oldChildren, newChildren) {
    return Utils.childrenDiffer(oldChildren, newChildren);
  }
}
