/* global Buffer */

import deadbeef from 'deadbeef';
import { EventEmitter } from './events.js';
import * as Utils       from './utils.js';
import {
  $,
  isJibish,
  resolveChildren,
  constructJib,
} from './jib.js';

export const UPDATE_EVENT              = '@jibs/component/event/update';
export const QUEUE_UPDATE_METHOD       = Symbol.for('@jibs/component/queueUpdate');
export const FLUSH_UPDATE_METHOD       = Symbol.for('@jibs/component/flushUpdate');
export const INIT_METHOD               = Symbol.for('@jibs/component/__init');
export const SKIP_STATE_UPDATES        = Symbol.for('@jibs/component/skipStateUpdates');
export const PENDING_STATE_UPDATE      = Symbol.for('@jibs/component/pendingStateUpdate');
export const LAST_RENDER_TIME          = Symbol.for('@jibs/component/lastRenderTime');
export const PREVIOUS_STATE            = Symbol.for('@jibs/component/previousState');
export const CAPTURE_REFERENCE_METHODS = Symbol.for('@jibs/component/previousState');

const elementDataCache = new WeakMap();

function isValidStateObject(value) {
  if (value == null)
    return false;

  if (Object.is(value, NaN))
    return false;

  if (Object.is(value, Infinity))
    return false;

  if (value instanceof Boolean || value instanceof Number || value instanceof String)
    return false;

  let typeOf = typeof value;
  if (typeOf === 'string' || typeOf === 'number' || typeOf === 'boolean')
    return false;

  if (Array.isArray(value))
    return false;

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value))
    return false;

  return true;
}

export class Component extends EventEmitter {
  static UPDATE_EVENT = UPDATE_EVENT;

  [QUEUE_UPDATE_METHOD]() {
    if (this[PENDING_STATE_UPDATE])
      return;

    this[PENDING_STATE_UPDATE] = Promise.resolve();
    this[PENDING_STATE_UPDATE].then(this[FLUSH_UPDATE_METHOD].bind(this));
  }

  [FLUSH_UPDATE_METHOD]() {
    // Was the state update cancelled?
    if (!this[PENDING_STATE_UPDATE])
      return;

    this.emit(UPDATE_EVENT);

    this[PENDING_STATE_UPDATE] = null;
  }

  [INIT_METHOD]() {
    this[SKIP_STATE_UPDATES] = false;
  }

  constructor(_jib) {
    super();

    // Bind all class methods to "this"
    Utils.bindMethods.call(this, this.constructor.prototype);

    let jib = _jib || {};

    const createNewState = () => {
      let localState = Object.create(null);

      return new Proxy(localState, {
        get: (target, propName) => {
          return target[propName];
        },
        set: (target, propName, value) => {
          let currentValue = target[propName];
          if (currentValue === value)
            return true;

          if (!this[SKIP_STATE_UPDATES])
            this[QUEUE_UPDATE_METHOD]();

          target[propName] = value;
          this.onStateUpdated(propName, value, currentValue);

          return true;
        },
      });
    };

    let props       = Object.assign(Object.create(null), jib.props || {});
    let _localState = createNewState();

    Object.defineProperties(this, {
      [SKIP_STATE_UPDATES]: {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        true,
      },
      [PENDING_STATE_UPDATE]: {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        Promise.resolve(),
      },
      [LAST_RENDER_TIME]: {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        Utils.now(),
      },
      [CAPTURE_REFERENCE_METHODS]: {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        {},
      },
      'id': {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        jib.id,
      },
      'props': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        props,
      },
      'children': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        jib.children || [],
      },
      'context': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        jib.context || Object.create(null),
      },
      'state': {
        enumerable:   false,
        configurable: true,
        get:          () => {
          return _localState;
        },
        set:          (value) => {
          if (!isValidStateObject(value))
            throw new TypeError(`Invalid value for "this.state": "${value}". Provided "state" must be an iterable object.`);

          Object.assign(_localState, value);
        },
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

  pushRender(renderResult) {
    this.emit(UPDATE_EVENT, renderResult);
  }

  // eslint-disable-next-line no-unused-vars
  onPropUpdated(propName, newValue, oldValue) {
  }

  // eslint-disable-next-line no-unused-vars
  onStateUpdated(propName, newValue, oldValue) {
  }

  captureReference(name, interceptorCallback) {
    let method = this[CAPTURE_REFERENCE_METHODS][name];
    if (method)
      return method;

    method = (_ref, previousRef) => {
      let ref = _ref;

      if (typeof interceptorCallback === 'function')
        ref = interceptorCallback.call(this, ref, previousRef);

      Object.defineProperties(this, {
        [name]: {
          writable:     true,
          enumerable:   false,
          configurable: true,
          value:        ref,
        },
      });
    };

    if (typeof interceptorCallback !== 'function')
      this[CAPTURE_REFERENCE_METHODS] = method;

    return method;
  }

  forceUpdate() {
    this[QUEUE_UPDATE_METHOD]();
  }

  getState(propertyPath, defaultValue) {
    let state = this.state;
    if (arguments.length === 0)
      return state;

    if (Utils.instanceOf(propertyPath, 'object')) {
      let keys        = Object.keys(propertyPath).concat(Object.getOwnPropertySymbols(propertyPath));
      let finalState  = {};

      for (let i = 0, il = keys.length; i < il; i++) {
        let key = keys[i];
        let [ value, lastPart ] = Utils.fetchDeepProperty(state, key, propertyPath[key], true);
        if (lastPart == null)
          continue;

        finalState[lastPart] = value;
      }

      return finalState;
    } else {
      return Utils.fetchDeepProperty(state, propertyPath, defaultValue);
    }
  }

  setState(value) {
    if (!isValidStateObject(value))
      throw new TypeError(`Invalid value for "this.setState": "${value}". Provided "state" must be an iterable object.`);

    Object.assign(this.state, value);
  }

  setStatePassive(value) {
    if (!isValidStateObject(value))
      throw new TypeError(`Invalid value for "this.setStatePassive": "${value}". Provided "state" must be an iterable object.`);

    try {
      this[SKIP_STATE_UPDATES] = true;
      Object.assign(this.state, value);
    } finally {
      this[SKIP_STATE_UPDATES] = false;
    }
  }

  shouldUpdate() {
    return true;
  }

  destroy() {
    delete this.state;
    delete this.props;
    delete this.context;
    delete this[CAPTURE_REFERENCE_METHODS];
    this.clearAllDebounces();
  }

  renderWaiting() {
  }

  render(children) {
    return children;
  }

  updated() {
  }

  combineWith(sep, ...args) {
    let finalArgs = new Set();
    for (let i = 0, il = args.length; i < il; i++) {
      let arg = args[i];
      if (!arg)
        continue;

      if (Utils.instanceOf(arg, 'string')) {
        let values = arg.split(sep).filter(Utils.isNotEmpty);
        for (let i = 0, il = values.length; i < il; i++) {
          let value = values[i];
          finalArgs.add(value);
        }
      } else if (Array.isArray(arg)) {
        let values = arg.filter((value) => {
          if (!value)
            return false;

          if (!Utils.instanceOf(value, 'string'))
            return false;

          return Utils.isNotEmpty(value);
        });

        for (let i = 0, il = values.length; i < il; i++) {
          let value = values[i];
          finalArgs.add(value);
        }
      } else if (Utils.instanceOf(arg, 'object')) {
        let keys = Object.keys(arg);
        for (let i = 0, il = keys.length; i < il; i++) {
          let key   = keys[i];
          let value = arg[key];

          if (!value) {
            finalArgs.delete(key);
            continue;
          }

          finalArgs.add(key);
        }
      }
    }

    return Array.from(finalArgs).join(sep || '');
  }

  classes(...args) {
    return this.combineWith(' ', ...args);
  }

  extractChildren(_patterns, children, _options) {
    let options   = _options || {};
    let extracted = {};
    let patterns  = _patterns;
    let isArray   = Array.isArray(patterns);

    const isMatch = (jib) => {
      let jibType = jib.Type;
      if (Utils.instanceOf(jibType, 'string'))
        jibType = jibType.toLowerCase();

      if (isArray) {
        for (let i = 0, il = patterns.length; i < il; i++) {
          let pattern = patterns[i];
          if (Utils.instanceOf(pattern, 'string'))
            pattern = pattern.toLowerCase();

          if (jibType !== pattern)
            continue;

          if (extracted[pattern] && options.multiple) {
            if (!Array.isArray(extracted[pattern]))
              extracted[pattern] = [ extracted[pattern] ];

            extracted[pattern].push(jib);
          } else {
            extracted[pattern] = jib;
          }

          return true;
        }
      } else {
        let keys = Object.keys(patterns);
        for (let i = 0, il = keys.length; i < il; i++) {
          let key     = keys[i];
          let pattern = patterns[key];
          let result;

          if (Utils.instanceOf(pattern, RegExp))
            result = pattern.test(jibType);
          else if (Utils.instanceOf(pattern, 'string'))
            result = (pattern.toLowerCase() === jibType);
          else
            result = (pattern === jibType);

          if (!result)
            continue;

          if (extracted[pattern] && options.multiple) {
            if (!Array.isArray(extracted[pattern]))
              extracted[pattern] = [ extracted[pattern] ];

            extracted[pattern].push(jib);
          } else {
            extracted[pattern] = jib;
          }

          return true;
        }
      }

      return false;
    };

    extracted.remainingChildren = children.filter((jib) => !isMatch(jib));
    return extracted;
  }

  mapChildren(patterns, _children) {
    let children = (!Array.isArray(_children)) ? [ _children ] : _children;

    return children.map((jib) => {
      if (!jib)
        return jib;

      let jibType = jib.Type;
      if (!Utils.instanceOf(jibType, 'string'))
        return jib;

      jibType = jibType.toLowerCase();

      let keys = Object.keys(patterns);
      for (let i = 0, il = keys.length; i < il; i++) {
        let key = keys[i];
        if (key.toLowerCase() !== jibType)
          continue;

        let method = patterns[key];
        if (!method)
          continue;

        return method.call(this, jib, i, children);
      }

      return jib;
    });
  }

  debounce(func, time, _id) {
    const clearPendingTimeout = () => {
      if (pendingTimer && pendingTimer.timeout) {
        clearTimeout(pendingTimer.timeout);
        pendingTimer.timeout = null;
      }
    };

    var id = (!_id) ? ('' + func) : _id;
    if (!this.debounceTimers) {
      Object.defineProperty(this, 'debounceTimers', {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        {},
      });
    }

    var pendingTimer = this.debounceTimers[id];
    if (!pendingTimer)
      pendingTimer = this.debounceTimers[id] = {};

    pendingTimer.func = func;
    clearPendingTimeout();

    var promise = pendingTimer.promise;
    if (!promise || !promise.isPending()) {
      let status = 'pending';
      let resolve;

      promise = pendingTimer.promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      promise.resolve = () => {
        if (status !== 'pending')
          return;

        status = 'fulfilled';
        clearPendingTimeout();
        this.debounceTimers[id] = null;

        if (typeof pendingTimer.func === 'function') {
          var ret = pendingTimer.func.call(this);
          if (ret instanceof Promise || (ret && typeof ret.then === 'function'))
            ret.then((value) => resolve(value));
          else
            resolve(ret);
        } else {
          resolve();
        }
      };

      promise.cancel = () => {
        status = 'rejected';
        clearPendingTimeout();
        this.debounceTimers[id] = null;

        promise.resolve();
      };

      promise.isPending = () => {
        return (status === 'pending');
      };
    }

    // eslint-disable-next-line no-magic-numbers
    pendingTimer.timeout = setTimeout(promise.resolve, (time == null) ? 250 : time);

    return promise;
  }

  clearDebounce(id) {
    if (!this.debounceTimers)
      return;

    var pendingTimer = this.debounceTimers[id];
    if (pendingTimer == null)
      return;

    if (pendingTimer.timeout)
      clearTimeout(pendingTimer.timeout);

    if (pendingTimer.promise)
      pendingTimer.promise.cancel();
  }

  clearAllDebounces() {
    let debounceTimers  = this.debounceTimers || {};
    let ids             = Object.keys(debounceTimers);

    for (let i = 0, il = ids.length; i < il; i++)
      this.clearDebounce(ids[i]);
  }

  getElementData(element) {
    let data = elementDataCache.get(element);
    if (!data) {
      data = {};
      elementDataCache.set(element, data);
    }

    return data;
  }

  memoize(func) {
    let cacheID;
    let cachedResult;

    return function(...args) {
      let newCacheID = deadbeef(...args);
      if (newCacheID !== cacheID) {
        let result = func.apply(this, args);

        cacheID = newCacheID;
        cachedResult = result;
      }

      return cachedResult;
    };
  }

  toTerm(term) {
    if (isJibish(term)) {
      let jib = constructJib(term);

      if (jib.Type === Term)
        return term;

      if (jib.Type && jib.Type[TERM_COMPONENT_TYPE_CHECK])
        return term;

      return $(Term, jib.props)(...jib.children);
    } else if (typeof term === 'string') {
      return $(Term)(term);
    }

    return term;
  }
}

const TERM_COMPONENT_TYPE_CHECK = Symbol.for('@jibs/isTerm');

class Term extends Component {
  resolveTerm(args) {
    let termResolver = this.context._termResolver;
    if (typeof termResolver === 'function')
      return termResolver.call(this, args);

    let children = (args.children || []);
    return children[children.length - 1] || '';
  }

  render(children) {
    let term = this.resolveTerm({ children, props: this.props });
    return $('SPAN', this.props)(term);
  }
}

Term[TERM_COMPONENT_TYPE_CHECK] = true;

export {
  Term,
};
