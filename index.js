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

  var start_node = {
    data: params.start,
    g: 0,
    h: params.heuristic(params.start),
  };
  start_node.f = start_node.h;
  // leave .parent undefined
  var closed_data_set = new StringSet();
  var open_heap = new Heap(heapComparator);
  var open_data_map = dict();
  open_heap.push(start_node);
  open_data_map.set(hash(start_node.data), start_node);
  var start_time = new Date();
  while (open_data_map.size) {
    if (new Date() - start_time > params.timeout) break;
    var node = open_heap.pop();
    open_data_map.delete(hash(node.data));
    if (params.isEnd(node.data)) {
      // done
      return reconstruct_path(node);
    }
    // not done yet
    closed_data_set.add(hash(node.data));
    var neighbors = params.neighbor(node.data);
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor_data = neighbors[i];
      if (closed_data_set.contains(hash(neighbor_data))) {
        // skip closed neighbors
        continue;
      }
      var g_from_this_node = node.g + params.distance(node.data, neighbor_data);
      var neighbor_node = open_data_map.get(hash(neighbor_data));
      var update = false;
      if (neighbor_node === undefined) {
        // add neighbor to the open set
        neighbor_node = {
          data: neighbor_data,
        };
        // other properties will be set later
        open_data_map.set(hash(neighbor_data), neighbor_node);
      } else {
        if (neighbor_node.g < g_from_this_node) {
          // skip this one because another route is faster
          continue;
        }
        update = true;
      }
      // found a new or better route.
      // update this neighbor with this node as its new parent
      neighbor_node.parent = node;
      neighbor_node.g = g_from_this_node;
      neighbor_node.h = params.heuristic(neighbor_data);
      neighbor_node.f = g_from_this_node + neighbor_node.h;
      if (update) {
        open_heap.heapify();
      } else {
        open_heap.push(neighbor_node);
      }
    }
  }
  // all the neighbors of every accessible node have been exhausted,
  // or timeout has occurred.
  // path is impossible.
  return undefined;
}

function reconstruct_path(node) {
  if (node.parent !== undefined) {
    var path_so_far = reconstruct_path(node.parent);
    path_so_far.push(node.data);
    return path_so_far;
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
