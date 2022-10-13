'use strict';

const {
  JIB_BARREN,
  JIB_PROXY,
  JIB,
  Jib,
  factory,
  $,
  isJibish,
  constructJib,
} = require('./jib');

const {
  UPDATE_EVENT,
  QUEUE_UPDATE_METHOD,
  FLUSH_UPDATE_METHOD,
  INIT_METHOD,
  SKIP_STATE_UPDATES,
  PENDING_STATE_UPDATE,
  LAST_RENDER_TIME,
  PREVIOUS_STATE,

  Component,
} = require('./component');

const {
  CONTEXT_ID,
  RootNode,
  Renderer,
} = require('./renderers');

const Utils = require('./utils');

module.exports = {
  // Jib
  Jibs: {
    JIB_BARREN,
    JIB_PROXY,
    JIB,
    Jib,
    isJibish,
    constructJib,
  },
  factory,
  $,

  // Component
  Components: {
    UPDATE_EVENT,
    QUEUE_UPDATE_METHOD,
    FLUSH_UPDATE_METHOD,
    INIT_METHOD,
    SKIP_STATE_UPDATES,
    PENDING_STATE_UPDATE,
    LAST_RENDER_TIME,
    PREVIOUS_STATE,
  },
  Component,

  // Renderers
  Renderers: {
    CONTEXT_ID,
    RootNode,
    Renderer,
  },

  // Utils
  Utils,
};
