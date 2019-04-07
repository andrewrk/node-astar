
var assert = require('assert')
    , aStar = require('../').AsyncAStar
    , forkJoin = require("rxjs").forkJoin

var allPromise = [];
let testCompleted = 0;

// shallow entry-wise comparison
function arraysEqual(array1, array2) {
    if (array1.length !== array2.length) return false;
    for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) return false;
    }
    return true;
}

/**
 * Simplest example I could think of without being completely trivial.
 * Start at 5 and find a path to 0 along a number line.
 * The solution is [5, 4, 3, 2, 1, 0].
 */
function testLinear() {
    return aStar({
        start: 5,
        isEnd: function (n) {
            return n === 0;
        },
        neighbor: function (x) {
            return [x - 1, x + 1];
        },
        distance: function (a, b) {
            return 1;
        },
        heuristic: function (x) {
            return x;
        },
    }).subscribe(results => {
        assert.strictEqual(results.status, 'success');
        assert.ok(arraysEqual(results.path, [5, 4, 3, 2, 1, 0]));
        testCompleted++;
    });
}

allPromise.push(testLinear());

var planarNeighbors = function (xy) {
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
var euclideanDistance = function (a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy);
};
var rectilinearDistance = function (a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.abs(dx) + Math.abs(dy);
};

/**
 * A simple 2-d test with 8 neighbors per cell.
 * Solution is a diagonal line directly from size,size to 0,0.
 */
function testPlane(size) {
    var end = [0, 0];
    return aStar({
        start: [size, size],
        isEnd: function (n) {
            return n[0] === end[0] && n[1] === end[1];
        },
        neighbor: planarNeighbors,
        distance: euclideanDistance,
        heuristic: function (xy) {
            return rectilinearDistance(xy, end);
        },
    }).subscribe(results => {
        assert.strictEqual(results.status, 'success');
        for (var i = size; i >= 0; i--) {
            assert.ok(arraysEqual(results.path.shift(), [i, i]));
        }
        testCompleted++;

    })
}

 allPromise.push(testPlane(5));
 allPromise.push(testPlane(50));

/**
 * Tests navigating a maze.
 * @param maze Array of strings. '#' is wall, 's' is start, 'e' is end, anything else is floor. Maze must be bordered by '#' signs.
 * @param nodeCount The number of nodes in the answer including the start and the end, or null if the maze is impossible.
 */
function testMaze(maze, nodeCount, closestNodeCount) {
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

    return aStar({
        start: start,
        isEnd: function (n) {
            return n[0] === end[0] && n[1] === end[1];
        },
        neighbor: function (xy) {
            return planarNeighbors(xy).filter(function (xy) {
                // cell is walkable if it's not a "#" sign
                return maze[xy[1]].charAt(xy[0]) !== "#";
            });
        },
        distance: euclideanDistance,
        heuristic: function (xy) {
            return euclideanDistance(xy, end);
        },
    }).subscribe(results => {
        if (nodeCount != null) {
            assert.strictEqual(results.status, 'success');
            assert.strictEqual(results.path.length, nodeCount);
        } else {
            assert.strictEqual(results.status, 'noPath');
            assert.strictEqual(results.path.length, closestNodeCount);
        }
        testCompleted++;
    })
}

allPromise.push(testMaze([
    "###########",
    "# #       #",
    "#e# s ## ##",
    "# #       #",
    "# ## #### #",
    "#         #",
    "###########",
], 8));
allPromise.push(testMaze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#         #",
    "###########",
], 16));
allPromise.push(testMaze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#     #   #",
    "###########",
], null, 4));

// // every 10 cells (including start) is marked by a digit
allPromise.push(testMaze([
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
], 84));

setInterval(() => (allPromise.length === testCompleted ? process.exit(0) : console.log(allPromise.length, testCompleted)), 1000);


process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));