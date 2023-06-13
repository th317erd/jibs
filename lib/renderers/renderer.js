import {
  CONTEXT_ID,
  RootNode,
} from './root-node.js';

const INITIAL_CONTEXT_ID = 1n;
let _contextIDCounter = INITIAL_CONTEXT_ID;

export class Renderer extends RootNode {
  static RootNode = RootNode;

  constructor(options) {
    super(null, null, null);

    Object.defineProperties(this, {
      'options': {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        options || {},
      },
    });

    this.renderer = this;

    if (typeof options.termResolver === 'function')
      this.context._termResolver = options.termResolver;
  }

  getOptions() {
    return this.options;
  }

  resolveTerm(args) {
    let { termResolver } = this.getOptions();
    if (typeof termResolver === 'function')
      return termResolver.call(this, args);

    let children = (args.children || []);
    return children[children.length - 1] || '';
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
