# a-star

Generic A* algorithm.

*WORK IN PROGRESS*

## Usage

```js

```

## Documentation

`aStar(options, callback)`

### callback(err, results)

`results` is an array of nodes including start and end, or `null` if no path
is found.

### options accepted

 * `start` - the start node
 * `isEnd` - (node) function that returns whether a node is an acceptable end
 * `neighbor` - (node) function that returns an array of neighbors for a node
 * `distance` - (a, b) function that returns the distance cost between two
   nodes
 * `heuristic` - (node) function that returns the heuristic guess for a node.
   the smaller the better.
 * `timeout` - optional limit to amount of milliseconds to search before
   returning null.
