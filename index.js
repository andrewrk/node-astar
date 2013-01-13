var assert = require('assert');
//var Heap = require('heap').Heap;
//var Set = require('Set');


module.exports = aStar;


/**
 * A Map datastructure. Provides size() and isEmpty() among other methods.
 *
 * NOTE: this class is broken if anyone adds methods to Object.prototype
 *
 * Examples:
 * var map = new Map({"a": 1, "b": 2});
 * map.get("a"); // 1
 * map.put("a", 3);
 * map.get("a"); // 3
 * map.remove("b");
 * map.get("b"); // undefined
 * map.size(); // 1
 * map.isEmpty(); // false
 * map.clear();
 * map.size(); // 0
 * map.isEmpty(); // true
 */
function Map(items) {
    this.clear();
    if (items !== undefined) {
        for (var key in items) {
            this.put(key, items[key]);
        }
    }
}
Map.prototype.put = function(key, value) {
    this._size = undefined;
    this.values[key] = value;
};
Map.prototype.get = function(key) {
    return this.values[key];
};
Map.prototype.remove = function(key) {
    delete this.values[key];
};
Map.prototype.contains = function(key) {
    return this.values[key] !== undefined;
};
Map.prototype.size = function() {
    if (this._size === undefined) {
        this._size = 0;
        for (var key in this.values) {
            this._size++;
        }
    }
    return this._size;
};
Map.prototype.isEmpty = function() {
    // don't need to use size
    for (var key in this.values) {
        return false;
    }
    return true;
};
Map.prototype.clear = function() {
    this.values = {};
    this._size = 0;
};
/**
 * this class was mostly copied from python's heapq.py module
 */
function Heap(key_func) {
    if (key_func === undefined) {
        key_func = function(x) { return x;};
    }
    this.key_func = key_func;
    this.clear();
}
Heap.prototype.clear = function() {
    this.entries = [];
};
Heap.prototype.size = function() {
    return this.entries.length;
}
Heap.prototype.isEmpty = function() {
    return this.entries.length === 0;
}
Heap.prototype.add = function(item) {
    var key = this.key_func(item);
    var entry = [key, item];
    this.entries.push(entry);
    this._siftDown(0, this.entries.length - 1);
};
Heap.prototype.take = function() {
    var last_entry = this.entries.pop();
    if (this.entries.length === 0) {
        // taking from empty returns undefined
        return last_entry !== undefined ? last_entry[1] : undefined;
    }
    var first_entry = this.entries[0];
    this.entries[0] = last_entry;
    this._siftUp(0);
    return first_entry[1];
};
Heap.prototype.reheapify = function() {
    var i;
    for (i = 0; i < this.entries.length; i++) {
        this.entries[i][0] = this.key_func(this.entries[i][1]);
    }
    for (i = this.entries.length >> 1; i >= 0; i--) {
        this._siftUp(i);
    }
};

Heap.prototype._siftDown = function(start, index) {
    var new_entry = this.entries[index];
    while (index > start) {
        var parent_index = (index - 1) >> 1;
        var parent_entry = this.entries[parent_index];
        if (new_entry[0] < parent_entry[0]) {
            this.entries[index] = parent_entry;
            index = parent_index;
            continue;
        }
        break;
    }
    this.entries[index] = new_entry;
};

Heap.prototype._siftUp = function(index) {
    var end_index = this.entries.length;
    var start_index = index;
    var new_entry = this.entries[index];

    // start child index with the left child
    var child_index = 2 * index + 1;
    while (child_index < end_index) {
        var right_index = child_index + 1;
        if (right_index < end_index && this.entries[child_index][0] >= this.entries[right_index][0]) {
            // right child is smaller
            child_index = right_index;
        }
        // child index is now the smaller child
        this.entries[index] = this.entries[child_index];
        index = child_index;
        child_index = 2 * index + 1;
    }
    this.entries[index] = new_entry;
    this._siftDown(start_index, index);
};


/**
 * A Set datastructure. Note: only stores strings.
 *
 * NOTE: this class is broken if anyone adds methods to Object.prototype
 *
 * Examples:
 * var set = new Set(["a", "b"]);
 * set.contains("b"); // true
 * set.add("b"); // does nothing
 * set.remove("b");
 * set.contains("b"); // false
 * set.clear();
 * set.add("c");
 * set.size(); // 1
 * for (var value in set.values) {
 *     set.contains(value); // true
 * }
 */
function Set(items) {
    this.clear();
    if (items !== undefined) {
        for (var i = 0; i < items.length; i++) {
            this.add(items[i]);
        }
    }
}

Set.prototype.list = function() {
    var all = [];
    var val;
    for (val in this.values) {
        all.push(val);
    }
    return all;
};

/**
 * returns if the item wasn't already in the set.
 */
Set.prototype.add = function(item) {
    this._size = undefined;
    var old_value = this.values[item];
    this.values[item] = item;
    return old_value === undefined;
};
Set.prototype.remove = function(item) {
    this._size = undefined;
    delete this.values[item];
};
Set.prototype.contains = function(item) {
    return this.values[item] !== undefined;
};
Set.prototype.size = function() {
    if (this._size === undefined) {
        this._size = 0;
        for (var item in this.values) {
            this._size++;
        }
    }
    return this._size;
};
Set.prototype.isEmpty = function() {
    // don't need to use size
    for (var item in this.values) {
        return false;
    }
    return true;
};
Set.prototype.clear = function() {
    this.values = {};
    this._size = 0;
};
Set.prototype.equals = function(other) {
    if (other.constructor !== Set) {
        return false;
    }
    if (this.size() !== other.size()) {
        return false;
    }
    for (var item in this.values) {
        if (!other.contains(item)) {
            return false;
        }
    }
    return true;
};

Set.prototype.minus = function(other) {
    var result = new Set();
    for (var item in this.values) {
        if (!other.contains(item)) {
            result.add(item);
        }
    }
    return result;
};


function aStar(params) {
  assert.ok(params.start !== undefined);
  assert.ok(params.isEnd !== undefined);
  assert.ok(params.neighbor);
  assert.ok(params.distance);
  assert.ok(params.heuristic);
  if (params.timeout === undefined) params.timeout = Infinity;
  assert.ok(!isNaN(params.timeout));

  var start_node = {
    data: params.start,
    g: 0,
    h: params.heuristic(params.start),
  };
  start_node.f = start_node.h;
  // leave .parent undefined
  var closed_data_set = new Set();
  var open_heap = new Heap(function(node) { return node.f; });
  var open_data_map = new Map();
  open_heap.add(start_node);
  open_data_map.put(start_node.data, start_node);
  var start_time = new Date();
  while (!open_data_map.isEmpty()) {
    if (new Date() - start_time > params.timeout) break;
    var node = open_heap.take();
    open_data_map.remove(node.data);
    if (params.isEnd(node.data)) {
      // done
      return reconstruct_path(node);
    }
    // not done yet
    closed_data_set.add(node.data);
    var neighbors = params.neighbor(node.data);
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor_data = neighbors[i];
      if (closed_data_set.contains(neighbor_data)) {
        // skip closed neighbors
        continue;
      }
      var g_from_this_node = node.g + params.distance(node.data, neighbor_data);
      var neighbor_node = open_data_map.get(neighbor_data);
      var update = false;
      if (neighbor_node === undefined) {
        // add neighbor to the open set
        neighbor_node = {
          "data": neighbor_data,
        };
        // other properties will be set later
        open_data_map.put(neighbor_data, neighbor_node);
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
        open_heap.reheapify();
      } else {
        open_heap.add(neighbor_node);
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
