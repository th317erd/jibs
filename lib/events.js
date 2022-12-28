const EVENT_LISTENERS = Symbol.for('@jibs/events/listeners');

export class EventEmitter {
  constructor() {
    Object.defineProperties(this, {
      [EVENT_LISTENERS]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        new Map(),
      },
    });
  }

  addListener(eventName, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('Event listener must be a method');

    let eventMap  = this[EVENT_LISTENERS];
    let scope     = eventMap.get(eventName);

    if (!scope) {
      scope = [];
      eventMap.set(eventName, scope);
    }

    scope.push(listener);

    return this;
  }

  removeListener(eventName, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('Event listener must be a method');

    let eventMap  = this[EVENT_LISTENERS];
    let scope     = eventMap.get(eventName);
    if (!scope)
      return this;

    let index = scope.indexOf(listener);
    if (index >= 0)
      scope.splice(index, 1);

    return this;
  }

  removeAllListeners(eventName) {
    let eventMap  = this[EVENT_LISTENERS];
    if (!eventMap.has(eventName))
      return this;

    eventMap.set(eventName, []);

    return this;
  }

  emit(eventName, ...args) {
    let eventMap  = this[EVENT_LISTENERS];
    let scope     = eventMap.get(eventName);
    if (!scope || scope.length === 0)
      return false;

    for (let i = 0, il = scope.length; i < il; i++) {
      let eventCallback = scope[i];
      eventCallback.apply(this, args);
    }

    return true;
  }

  once(eventName, listener) {
    let func = (...args) => {
      this.off(eventName, func);
      return listener(...args);
    };

    return this.on(eventName, func);
  }

  on(eventName, listener) {
    return this.addListener(eventName, listener);
  }

  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }

  eventNames() {
    return Array.from(this[EVENT_LISTENERS].keys());
  }

  listenerCount(eventName) {
    let eventMap  = this[EVENT_LISTENERS];
    let scope     = eventMap.get(eventName);
    if (!scope)
      return 0;

    return scope.length;
  }

  listeners(eventName) {
    let eventMap  = this[EVENT_LISTENERS];
    let scope     = eventMap.get(eventName);
    if (!scope)
      return [];

    return scope.slice();
  }
}
