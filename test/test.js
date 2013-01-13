var assert = require('assert')
  , aStar = require('../')

/** removes value from array. returns success */
Array.prototype.remove = function(value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
            this.splice(i, 1);
            return true;
        }
    }
    return false;
};
/** removes item from array at index. returns old value. */
Array.prototype.removeAt = function(index) {
    return this.splice(index, 1)[0];
};
/** removes all items */
Array.prototype.clear = function() {
    this.splice(0, this.length);
};
/** shallow entry-wise comparison */
Array.prototype.equals = function(other) {
    if (this.length !== other.length) {
        // also checks for non-arrays
        return false;
    }
    for (var i = 0; i < this.length; i++) {
        if (this[i] !== other[i]) {
            return false;
        }
    }
    return true;
};
Array.prototype.extend = function(other) {
    for (var i = 0; i < other.length; i++) {
        this.push(other[i]);
    }
};
Array.prototype.clone = function() {
    return this.slice(0);
};
Array.prototype.reversed = function() {
    var other = this.clone();
    other.reverse();
    return other;
};
/**
 * returns a copy of this array but only including elements that make the
 * provided predicate function return true. Function is passed each item
 * and should return a boolean.
 */
Array.prototype.filtered = function(predicate_func) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (predicate_func(item)) {
            result.push(item);
        }
    }
    return result;
};

Array.prototype.mapped = function(transformer_func) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        result.push(transformer_func(this[i]));
    }
    return result;
};

/**
 * Simplest example I could think of without being completely trivial.
 * Start at 5 and find a path to 0 along a number line.
 * The solution is [5, 4, 3, 2, 1, 0].
 */
function test_linear() {
    var path = aStar({
        start: 5,
        isEnd: function(n) { return n === 0; },
        neighbor: function(x) { return [x - 1, x + 1]; },
        distance: function(a, b) { return 1; },
        heuristic: function(x) { return x; },
    });
    assert.ok(path.equals([5, 4, 3, 2, 1, 0]));
}
test_linear();

var planar_neighbors = function(xy) {
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
var euclidean_distance = function(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy);
};
var rectilinear_distance = function(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.abs(dx) + Math.abs(dy);
};

/**
 * A simple 2-d test with 8 neighbors per cell.
 * Solution is a diagonal line directly from size,size to 0,0.
 */
function test_plane(size) {
    var end = [0, 0];
    var path = aStar({
        start: [size, size],
        isEnd: function(n) {return n[0] === end[0] && n[1] === end[1];},
        neighbor: planar_neighbors,
        distance: euclidean_distance,
        heuristic: function(xy) {
            return rectilinear_distance(xy, end);
        },
    });
    for (var i = size; i >= 0; i--) {
        assert.ok(path.shift().equals([i, i]));
    }
}
test_plane(5);
test_plane(50);

/**
 * Tests navigating a maze.
 * @param maze Array of strings. '#' is wall, 's' is start, 'e' is end, anything else is floor. Maze must be bordered by '#' signs.
 * @param node_count The number of nodes in the answer including the start and the end, or undefined if the maze is impossible.
 */
function test_maze(maze, node_count) {
    // find the start and end positions
    var start;
    for (var y = 0; y < maze.length; y++) {
        var start_x = maze[y].indexOf("s");
        if (start_x !== -1) {
            start = [start_x, y];
            break;
        }
    }
    assert.ok(start !== undefined);
    var end;
    for (y = 0; y < maze.length; y++) {
        var end_x = maze[y].indexOf("e");
        if (end_x !== -1) {
            end = [end_x, y];
            break;
        }
    }
    assert.ok(end !== undefined);

    var path = aStar({
        start: start,
        isEnd: function(n) {return n[0] === end[0] && n[1] === end[1];},
        neighbor: function(xy) {
            return planar_neighbors(xy).filtered(function(xy) {
                // cell is walkable if it's not a "#" sign
                return maze[xy[1]].charAt(xy[0]) !== "#";
            });
        },
        distance: euclidean_distance,
        heuristic: function(xy) {
            return euclidean_distance(xy, end);
        },
    });
    if (node_count !== undefined) {
        assert.ok(path.length === node_count);
    } else {
        assert.ok(path === undefined);
    }
}
test_maze([
    "###########",
    "# #       #",
    "#e# s ## ##",
    "# #       #",
    "# ## #### #",
    "#         #",
    "###########",
], 8);
test_maze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#         #",
    "###########",
], 16);
test_maze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#     #   #",
    "###########",
], undefined);

// every 10 cells (including start) is marked by a digit
test_maze([
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

