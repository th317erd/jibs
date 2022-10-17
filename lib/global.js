'use strict';

const thisGlobal = ((typeof window !== 'undefined') ? window : global) || this;

async function fetchResource(url) {
  if (typeof fetch === 'function') {
    let result = await fetch(url);
  } else {

  }
}

async function load(resourcePath) {

}

module.exports = {
  load,
};

thisGlobal['load'] = load.bind(this);
