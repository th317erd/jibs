import { EventEmitter } from '../events.js';
import {
  CONTEXT_ID,
  RootNode,
} from './root-node.js';

const INITIAL_CONTEXT_ID = 1n;
let _contextIDCounter = 0n;

export class Renderer extends EventEmitter {
  static RootNode = RootNode;

  constructor() {
    super();

    Object.defineProperties(this, {
      'context': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        this.createContext(),
      },
      'destroying': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        false,
      },
      'renderFrame': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        0,
      },
    });
  }

  createContext(rootContext, onUpdate, onUpdateThis) {
    let context     = Object.create(null);
    let myContextID = (rootContext) ? rootContext[CONTEXT_ID] : INITIAL_CONTEXT_ID;

    return new Proxy(context, {
      get: (target, propName) => {
        if (propName === CONTEXT_ID) {
          let parentID = (rootContext) ? rootContext[CONTEXT_ID] : INITIAL_CONTEXT_ID;
          return (parentID > myContextID) ? parentID : myContextID;
        }

        if (!Object.prototype.hasOwnProperty.call(target, propName))
          return (rootContext) ? rootContext[propName] : undefined;

        return target[propName];
      },
      set: (target, propName, value) => {
        if (propName === CONTEXT_ID)
          return true;

        if (target[propName] === value)
          return true;

        myContextID = ++_contextIDCounter;
        target[propName] = value;

        if (typeof onUpdate === 'function')
          onUpdate.call(onUpdateThis, onUpdateThis);

        return true;
      },
    });
  }
}
