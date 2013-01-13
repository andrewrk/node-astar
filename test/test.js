var assert = require('assert')
  , aStar = require('../')

// shallow entry-wise comparison
function arraysEqual(array1, array2) {
  if (array1.length !== array2.length) return false;
  for (var i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }
  return true;
}

/**
 * returns a copy of this array but only including elements that make the
 * provided predicate function return true. Function is passed each item
 * and should return a boolean.
 */
function arrayFiltered(array, func) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (func(item)) result.push(item);
  }
  return result;
}


/**
 * Simplest example I could think of without being completely trivial.
 * Start at 5 and find a path to 0 along a number line.
 * The solution is [5, 4, 3, 2, 1, 0].
 */
function testLinear() {
  var path = aStar({
    start: 5,
    isEnd: function(n) { return n === 0; },
    neighbor: function(x) { return [x - 1, x + 1]; },
    distance: function(a, b) { return 1; },
    heuristic: function(x) { return x; },
  });
  assert.ok(arraysEqual(path, [5, 4, 3, 2, 1, 0]));
}
testLinear();

var planarNeighbors = function(xy) {
  var x = xy[0], y = xy[1];
  return [
    [x - 1, y - 1],
    [x - 1, y + 0],
    [x - 1, y + 1],
    [x + 0, y - 1],

    [x + 0, y + 1],
    [x + 1, y - 1],
    [x + 1, y + 0],
    [x + 1, y + 1],
  ];
};
var euclideanDistance = function(a, b) {
  var dx = b[0] - a[0], dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
};
var rectilinearDistance = function(a, b) {
  var dx = b[0] - a[0], dy = b[1] - a[1];
  return Math.abs(dx) + Math.abs(dy);
};

/**
 * A simple 2-d test with 8 neighbors per cell.
 * Solution is a diagonal line directly from size,size to 0,0.
 */
function testPlane(size) {
  var end = [0, 0];
  var path = aStar({
    start: [size, size],
    isEnd: function(n) {return n[0] === end[0] && n[1] === end[1];},
    neighbor: planarNeighbors,
    distance: euclideanDistance,
    heuristic: function(xy) {
      return rectilinearDistance(xy, end);
    },
  });
  for (var i = size; i >= 0; i--) {
    assert.ok(arraysEqual(path.shift(), [i, i]));
  }
}
testPlane(5);
testPlane(50);

/**
 * Tests navigating a maze.
 * @param maze Array of strings. '#' is wall, 's' is start, 'e' is end, anything else is floor. Maze must be bordered by '#' signs.
 * @param nodeCount The number of nodes in the answer including the start and the end, or null if the maze is impossible.
 */
function testMaze(maze, nodeCount) {
  // find the start and end positions
  var start;
  for (var y = 0; y < maze.length; y++) {
    var startX = maze[y].indexOf("s");
    if (startX !== -1) {
      start = [startX, y];
      break;
    }
  }
  assert.ok(start != null);
  var end;
  for (y = 0; y < maze.length; y++) {
    var endX = maze[y].indexOf("e");
    if (endX !== -1) {
      end = [endX, y];
      break;
    }
  }
  assert.ok(end != null);

  var path = aStar({
    start: start,
    isEnd: function(n) {return n[0] === end[0] && n[1] === end[1];},
    neighbor: function(xy) {
      return arrayFiltered(planarNeighbors(xy), function(xy) {
        // cell is walkable if it's not a "#" sign
        return maze[xy[1]].charAt(xy[0]) !== "#";
      });
    },
    distance: euclideanDistance,
    heuristic: function(xy) {
      return euclideanDistance(xy, end);
    },
  });
  if (nodeCount != null) {
    assert.ok(path.length === nodeCount);
  } else {
    assert.ok(path == null);
  }
}
testMaze([
    "###########",
    "# #       #",
    "#e# s ## ##",
    "# #       #",
    "# ## #### #",
    "#         #",
    "###########",
], 8);
testMaze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#         #",
    "###########",
], 16);
testMaze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#     #   #",
    "###########",
], null);

// every 10 cells (including start) is marked by a digit
testMaze([
    "##################################################################",
    "# #    2          #           ######## ######## # # ## #    # # ##",
    "# #### #### # ########## ############# #        # # ## #    # # ##",
    "#         # #          # #             ######## # # ## #    # # ##",
    "# # ####### ### ######## #############        # # # ## #    # # ##",
    "# #    # #    #  3            ######## ######## # #              #",
    "# # # ## ## ### ####### # #####        ########## ########### ####",
    "# ### #   # # # ####### # ############ #                 8  # # ##",
    "### # # #            ## #4           # ########## # # ## # ## # ##",
    "#s# # ################# # ############ ##       # # # ## # ## # ##",
    "# # 1           #       # #               #######7# # ## # ## #  #",
    "# # # ##### ## ######## # ############ ## #       # # ## #e## #  #",
    "# # ###   # #         # #       5      ##6####### ########### #  #",
    "# # # # #   ## ######## ##  ########## ##                        #",
    "#   # # ###### #        #       ######### # ################# ## #",
    "# # #        # ######## ##  #####         #                 # ## #",
    "##################################################################",
], 84);
