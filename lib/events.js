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
  }

  emit(eventName, ...args) {

  }

  on(eventName, listener) {

  }

  off(eventName, listener) {

  }

  removeListener(eventName, listener) {

  }

  removeAllListeners(eventName) {

  }
}
