const cacheMap          = new Map();
const resourceResolvers = new Set();

export function addResourceResolver(callback) {
  resourceResolvers.add(callback);
}

export function removeResourceResolver(callback) {
  resourceResolvers.delete(callback);
}

export function resolveResourcePath(resourcePath) {
  let currentPath = resourcePath;

  for (let resolver of resourceResolvers)
    currentPath = resolver(currentPath);

  return currentPath;
}

function load(_resourcePath) {
  let resourcePath  = resolveResourcePath(_resourcePath);
  let cache         = cacheMap.get(resourcePath);

  if (cache)
    return cache;

  let promise = eval(`(import('${resourcePath.replace(/'/g, '\\\'')}'))`).then((_resource) => {
    let resource = _resource;
    if (resource && resource.default)
      resource = resource.default;

    cacheMap.set(resourcePath, resource);

    return resource;
  });

  // Set promise as cache so
  // all promises from multiple
  // load requests are consistent
  cacheMap.set(resourcePath, promise);

  return promise;
}

Object.defineProperties(load, {
  addResolver: {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        addResourceResolver,
  },
  removeResolver: {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        removeResourceResolver,
  },
  resolve: {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        resolveResourcePath,
  },
});

export {
  load,
};
