/* eslint-disable no-magic-numbers */

'use strict';

/* global describe, expect, it, beforeEach */

import { Component } from '../lib/component.js';

describe('Component', () => {
  let component;

  beforeEach(() => {
    component = new Component({
      props: {
        test: true,
      },
      children: [],
      context:  {},
    });
  });

  describe('combine', () => {
    it('can properly combine things', () => {
      expect(component.combine('test', 'stuff', 'things')).toEqual('test stuff things');
      expect(component.combine('test', [ 'stuff', 'things' ])).toEqual('test stuff things');
      expect(component.combine('test', [ false, 'stuff', 0, 'things', null ])).toEqual('test stuff things');
      expect(component.combine('test', [ false, 'stuff', 0, 'things', null ])).toEqual('test stuff things');
      expect(component.combine('test     what    crazy', [ false, 'stuff', 0, 'things', null ])).toEqual('test what crazy stuff things');
      expect(component.combine({ test: false, bye: 0, hello: true, world: 1 })).toEqual('hello world');
      expect(component.combine({ test: false, bye: 0, hello: true, world: 1 }, { hello: {}, dude: true, world: false })).toEqual('hello dude');
    });
  });
});
