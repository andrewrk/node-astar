var assert = require('assert')
  , StringSet = require('Set')
  , Heap = require('heap')
// once https://github.com/domenic/dict/pull/7
// is pulled we can use that instead of this fork
  , dict = require('dict_')

module.exports = aStar;

function aStar(params) {
  assert.ok(params.start !== undefined);
  assert.ok(params.isEnd !== undefined);
  assert.ok(params.neighbor);
  assert.ok(params.distance);
  assert.ok(params.heuristic);
  if (params.timeout === undefined) params.timeout = Infinity;
  assert.ok(!isNaN(params.timeout));
  var hash = params.hash || defaultHash;

  var startNode = {
    data: params.start,
    g: 0,
    h: params.heuristic(params.start),
  };
  startNode.f = startNode.h;
  // leave .parent undefined
  var closedDataSet = new StringSet();
  var openHeap = new Heap(heapComparator);
  var openDataMap = dict();
  openHeap.push(startNode);
  openDataMap.set(hash(startNode.data), startNode);
  var startTime = new Date();
  while (openDataMap.size) {
    if (new Date() - startTime > params.timeout) break;
    var node = openHeap.pop();
    openDataMap.delete(hash(node.data));
    if (params.isEnd(node.data)) {
      // done
      return reconstructPath(node);
    }
    // not done yet
    closedDataSet.add(hash(node.data));
    var neighbors = params.neighbor(node.data);
    for (var i = 0; i < neighbors.length; i++) {
      var neighborData = neighbors[i];
      if (closedDataSet.contains(hash(neighborData))) {
        // skip closed neighbors
        continue;
      }
      var gFromThisNode = node.g + params.distance(node.data, neighborData);
      var neighborNode = openDataMap.get(hash(neighborData));
      var update = false;
      if (neighborNode === undefined) {
        // add neighbor to the open set
        neighborNode = {
          data: neighborData,
        };
        // other properties will be set later
        openDataMap.set(hash(neighborData), neighborNode);
      } else {
        if (neighborNode.g < gFromThisNode) {
          // skip this one because another route is faster
          continue;
        }
        update = true;
      }
      // found a new or better route.
      // update this neighbor with this node as its new parent
      neighborNode.parent = node;
      neighborNode.g = gFromThisNode;
      neighborNode.h = params.heuristic(neighborData);
      neighborNode.f = gFromThisNode + neighborNode.h;
      if (update) {
        openHeap.heapify();
      } else {
        openHeap.push(neighborNode);
      }
    }
  }
  // all the neighbors of every accessible node have been exhausted,
  // or timeout has occurred.
  // path is impossible.
  return undefined;
}

function reconstructPath(node) {
  if (node.parent !== undefined) {
    var pathSoFar = reconstructPath(node.parent);
    pathSoFar.push(node.data);
    return pathSoFar;
  } else {
    // this is the starting node
    return [node.data];
  }
}

function defaultHash(node) {
  return node.toString();
}

function heapComparator(a, b) {
  return a.f - b.f;
}
