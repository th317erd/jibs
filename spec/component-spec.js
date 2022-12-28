/* eslint-disable no-magic-numbers */

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

  describe('classes', () => {
    it('can properly classes things', () => {
      expect(component.classes('test', 'stuff', 'things')).toEqual('test stuff things');
      expect(component.classes('test', [ 'stuff', 'things' ])).toEqual('test stuff things');
      expect(component.classes('test', [ false, 'stuff', 0, 'things', null ])).toEqual('test stuff things');
      expect(component.classes('test', [ false, 'stuff', 0, 'things', null ])).toEqual('test stuff things');
      expect(component.classes('test     what    crazy', [ false, 'stuff', 0, 'things', null ])).toEqual('test what crazy stuff things');
      expect(component.classes({ test: false, bye: 0, hello: true, world: 1 })).toEqual('hello world');
      expect(component.classes({ test: false, bye: 0, hello: true, world: 1 }, { hello: {}, dude: true, world: false })).toEqual('hello dude');
    });
  });
});
