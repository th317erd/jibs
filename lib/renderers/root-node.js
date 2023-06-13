import deadbeef from 'deadbeef';
import * as Utils from '../utils.js';
import {
  isJibish,
  resolveChildren,
  constructJib,
} from '../jib.js';

export const CONTEXT_ID = Symbol.for('@jibs/node/contextID');

export class RootNode {
  static CONTEXT_ID = CONTEXT_ID;

  constructor(renderer, parentNode, _context, jib) {
    let context = null;

    if (this.constructor.HAS_CONTEXT !== false && (renderer || this.createContext)) {
      context = (renderer || this).createContext(
        _context,
        (this.onContextUpdate) ? this.onContextUpdate : undefined,
        this,
      );
    }

    Object.defineProperties(this, {
      'TYPE': {
        enumerable:   false,
        configurable: false,
        get:          () => this.constructor.TYPE,
        set:          () => {}, // NOOP
      },
      'id': {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        Utils.generateUUID(),
      },
      'renderer': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        renderer,
      },
      'parentNode': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parentNode,
      },
      'childNodes': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new Map(),
      },
      'context': {
        enumerable:   false,
        configurable: true,
        get:          () => {
          return context;
        },
        set:          () => {},
      },
      'destroying': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        false,
      },
      'renderPromise': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        null,
      },
      'renderFrame': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        0,
      },
      'jib': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        jib,
      },
      'nativeElement': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        null,
      },
    });
  }

  resolveChildren(children) {
    return resolveChildren.call(this, children);
  }

  isJib(value) {
    return isJibish(value);
  }

  constructJib(value) {
    return constructJib(value);
  }

  getCacheKey() {
    let { Type, props } = (this.jib || {});
    let cacheKey = deadbeef(Type, props.key);

    return cacheKey;
  }

  updateJib(newJib) {
    this.jib = newJib;
  }

  removeChild(childNode) {
    let cacheKey = childNode.getCacheKey();
    this.childNodes.delete(cacheKey);
  }

  addChild(childNode) {
    let cacheKey = childNode.getCacheKey();
    this.childNodes.set(cacheKey, childNode);
  }

  getChild(cacheKey) {
    return this.childNodes.get(cacheKey);
  }

  getThisNodeOrChildNodes() {
    return this;
  }

  getChildrenNodes() {
    let childNodes = [];
    for (let childNode of this.childNodes.values())
      childNodes = childNodes.concat(childNode.getThisNodeOrChildNodes());

    return childNodes.filter(Boolean);
  }

  async destroy(force) {
    if (!force && this.destroying)
      return;

    this.destroying = true;

    if (this.renderPromise)
      await this.renderPromise;

    await this.destroyFromDOM(this.context, this);

    let destroyPromises = [];
    for (let childNode of this.childNodes.values())
      destroyPromises.push(childNode.destroy());

    this.childNodes.clear();
    await Promise.all(destroyPromises);

    this.nativeElement = null;
    this.parentNode = null;
    this.context = null;
    this.jib = null;
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

  async render(...args) {
    if (this.destroying)
      return;

    this.renderFrame++;
    let renderFrame = this.renderFrame;

    if (typeof this._render === 'function') {
      this.renderPromise = this._render(...args)
        .then(async (result) => {
          if (renderFrame >= this.renderFrame)
            await this.syncDOM(this.context, this);

          this.renderPromise = null;
          return result;
        })
        .catch((error) => {
          this.renderPromise = null;
          throw error;
        });
    } else {
      await this.syncDOM(this.context, this);
    }

    return this.renderPromise;
  }

  getParentID() {
    if (!this.parentNode)
      return;

    return this.parentNode.id;
  }

  async destroyFromDOM(context, node) {
    if (!this.renderer)
      return;

    return await this.renderer.destroyFromDOM(context, node);
  }

  async syncDOM(context, node) {
    if (!this.renderer)
      return;

    return await this.renderer.syncDOM(context, node);
  }
}
