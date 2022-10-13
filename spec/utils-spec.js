/* eslint-disable no-magic-numbers */

'use strict';

/* global describe, expect, it */

const Utils = require('../lib/utils');

describe('Utils', () => {
  describe('propsDiffer', () => {
    it('can properly detect prop differences', () => {
      let a = { test: true };
      let b = { test: true };

      expect(Utils.propsDiffer(a, a)).toEqual(false);
      expect(Utils.propsDiffer(a, b)).toEqual(false);
      expect(Utils.propsDiffer({ test: true, hello: 'stuff' }, { test: true, hello: 'stuff' })).toEqual(false);
      expect(Utils.propsDiffer([], [])).toEqual(false);
      expect(Utils.propsDiffer([ 1 ], [ 1 ])).toEqual(false);

      expect(Utils.propsDiffer(null, undefined)).toEqual(true);
      expect(Utils.propsDiffer([], null)).toEqual(true);
      expect(Utils.propsDiffer(null, [])).toEqual(true);
      expect(Utils.propsDiffer([ 1 ], [ 2 ])).toEqual(true);
      expect(Utils.propsDiffer(a, {})).toEqual(true);
      expect(Utils.propsDiffer(a, { test: false })).toEqual(true);
      expect(Utils.propsDiffer({ test: [] }, { test: [] })).toEqual(true);
    });
  });

  describe('sizeOf', () => {
    it('can properly check the size of something', () => {
      expect(Utils.sizeOf(0)).toEqual(0);
      expect(Utils.sizeOf(false)).toEqual(0);
      expect(Utils.sizeOf(1)).toEqual(0);
      expect(Utils.sizeOf(true)).toEqual(0);
      expect(Utils.sizeOf(NaN)).toEqual(0);
      expect(Utils.sizeOf(Infinity)).toEqual(0);
      expect(Utils.sizeOf(null)).toEqual(0);
      expect(Utils.sizeOf(undefined)).toEqual(0);
      expect(Utils.sizeOf('')).toEqual(0);
      expect(Utils.sizeOf('1')).toEqual(1);
      expect(Utils.sizeOf('2')).toEqual(1);
      expect(Utils.sizeOf('23')).toEqual(2);
      expect(Utils.sizeOf([])).toEqual(0);
      expect(Utils.sizeOf([ 1 ])).toEqual(1);
      expect(Utils.sizeOf([ 1, 2 ])).toEqual(2);
      expect(Utils.sizeOf({})).toEqual(0);
      expect(Utils.sizeOf({ test: true })).toEqual(1);
    });
  });

  describe('fetchDeepProperty', () => {
    it('can get deep properties', () => {
      expect(Utils.fetchDeepProperty(undefined, 'test', 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty(null, 'test', 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty(NaN, 'test', 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty(Infinity, 'test', 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty({}, undefined, 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty({}, null, 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty({}, NaN, 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty({}, Infinity, 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty({}, 'test', 'nope!')).toEqual('nope!');
      expect(Utils.fetchDeepProperty({ one: { two: 'three' } }, [ 'one', 'derp' ], 'nope!')).toEqual('nope!');

      expect(Utils.fetchDeepProperty({ one: { two: 'three' } }, [ 'one', 'two' ])).toEqual('three');
      expect(Utils.fetchDeepProperty({ one: { two: 'three' } }, 'one.two')).toEqual('three');
      expect(Utils.fetchDeepProperty({ one: { two: 'three', wow: [ 1, 2, 3, 4 ] } }, 'one.wow.0')).toEqual(1);
      expect(Utils.fetchDeepProperty({ one: { two: 'three', wow: [ 1, { dude: 'cool!' }, 3, 4 ] } }, 'one.wow.1.dude')).toEqual('cool!');
      expect(Utils.fetchDeepProperty({ one: { two: 'three', wow: [ 1, { dude: 'cool!' }, 3, 4 ] } }, 'one.wow.1.dude.length')).toEqual(5);
    });
  });
});
