import {
  CONTEXT_ID,
  RootNode,
} from './root-node.js';

const INITIAL_CONTEXT_ID = 1n;
let _contextIDCounter = INITIAL_CONTEXT_ID;

export class Renderer extends RootNode {
  static RootNode = RootNode;

  constructor() {
    super(null, null, null);
    this.renderer = this;
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
