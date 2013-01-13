# a-star

Generic A* algorithm.

## Usage

```js
var aStar = require('a-star');
// if this is going to take a while you may want to child_process.fork
// and pass the results to the parent process
// see below for options
var path = aStar(options);
console.log(path);
```

## Documentation

`astar(options)`

### Return Value

Returns an array of nodes including start and end, or `null` if no path
is found.

### options accepted

 * `start` - the start node
 * `isEnd` - function(node) that returns whether a node is an acceptable end
 * `neighbor` - function(node) that returns an array of neighbors for a node
 * `distance` - function(a, b) that returns the distance cost between two
   nodes
 * `heuristic` - function(node) that returns a heuristic guess of the cost
   from `node` to an end.
 * `hash` - function(node) that returns a unique string for a node. this is
   so that we can put nodes in heap and set data structures which are based
   on plain old JavaScript objects. Defaults to using `node.toString`.
 * `timeout` - optional limit to amount of milliseconds to search before
   returning null.

The data type for nodes is unrestricted.
