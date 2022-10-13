'use strict';

const EventEmitter  = require('events');
const {
  CONTEXT_ID,
  RootNode,
}  = require('./root-node');

let _contextIDCounter = 0n;

class Renderer extends EventEmitter {
  static RootNode = RootNode;

  constructor() {
    super();
    this.setMaxListeners(Infinity);

    Object.defineProperties(this, {
      'context': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        this.createContext(),
      },
      'currentChildIndex': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        0,
      },
    });
  }

  createContext(rootContext, onUpdate) {
    let context     = Object.create(null);
    let myContextID = (rootContext) ? rootContext[CONTEXT_ID] : 1n;

    return new Proxy(context, {
      get: (target, propName) => {
        if (propName === CONTEXT_ID) {
          let parentID = (rootContext) ? rootContext[CONTEXT_ID] : 1n;
          return (parentID > myContextID) ? parentID : myContextID;
        }

        if (!Object.prototype.hasOwnProperty.call(target, propName))
          return (rootContext) ? rootContext[propName] : undefined;

        return target[propName];
      },
      set: (target, propName, value) => {
        if (propName === CONTEXT_ID)
          return true;

        myContextID = ++_contextIDCounter;
        target[propName] = value;

        if (typeof onUpdate === 'function')
          onUpdate();

        return true;
      },
    });
  }
}

module.exports = {
  CONTEXT_ID,
  Renderer,
};
