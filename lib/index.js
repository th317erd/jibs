import {
  JIB_BARREN,
  JIB_PROXY,
  JIB,
  Jib,
  factory,
  $,
  isJibish,
  constructJib,
  resolveChildren,
} from './jib.js';

export const Jibs = {
  JIB_BARREN,
  JIB_PROXY,
  JIB,
  Jib,
  isJibish,
  constructJib,
  resolveChildren,
};

import {
  UPDATE_EVENT,
  QUEUE_UPDATE_METHOD,
  FLUSH_UPDATE_METHOD,
  INIT_METHOD,
  SKIP_STATE_UPDATES,
  PENDING_STATE_UPDATE,
  LAST_RENDER_TIME,
  PREVIOUS_STATE,

  Component,
} from './component.js';

export const Components = {
  UPDATE_EVENT,
  QUEUE_UPDATE_METHOD,
  FLUSH_UPDATE_METHOD,
  INIT_METHOD,
  SKIP_STATE_UPDATES,
  PENDING_STATE_UPDATE,
  LAST_RENDER_TIME,
  PREVIOUS_STATE,
};

import {
  FORCE_REFLOW,
  RootNode,
  Renderer,
  RootElement,
  CommentElement,
  NativeElement,
  PortalElement,
  TextElement,
} from './renderers/index.js';

export const Renderers = {
  CONTEXT_ID: RootNode.CONTEXT_ID,
  FORCE_REFLOW,
  RootNode,
  Renderer,
  RootElement,
  CommentElement,
  NativeElement,
  PortalElement,
  TextElement,
};

export * as Utils from './utils.js';
export { default as deadbeef } from 'deadbeef';

export {
  factory,
  $,
  Component,
};
