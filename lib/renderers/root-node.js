import * as Utils from '../utils.js';

export const CONTEXT_ID = Symbol.for('@jibs/node/contextID');

let uuid = 1;

export class RootNode {
  static CONTEXT_ID = CONTEXT_ID;

  constructor(renderer, parent, _context) {
    let context = renderer.createContext(
      _context,
      (this.onContextUpdate) ? this.onContextUpdate : undefined,
      this,
    );

    Object.defineProperties(this, {
      'id': {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        uuid++,
      },
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
      'renderPromise': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        null,
      },
      'destroying': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        false,
      },
      'renderStartTime': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        Date.now(),
      },
    });
  }

  destroy() {
    this.destroying = true;
    this.context = null;
  }

  isValidChild(child) {
    return Utils.isValidChild(child);
  }

  isIterableChild(child) {
    return Utils.isIterableChild(child);
  }

  propsDiffer(oldProps, newProps, skipKeys) {
    return Utils.propsDiffer(oldProps, newProps, skipKeys);
  }

  childrenDiffer(oldChildren, newChildren) {
    return Utils.childrenDiffer(oldChildren, newChildren);
  }

  async render(jib, renderContext) {
    if (this.destroying)
      return;

    this.renderStartTime = Date.now();

    return this._render(jib, renderContext)
      .then((result) => {
        this.renderPromise = null;
        return result;
      })
      .catch((error) => {
        this.renderPromise = null;
        throw error;
      });
  }
}
