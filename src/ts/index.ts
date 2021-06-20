
import { AStarParamType, AStarResultType, AStarResultStatus, InternalNode } from './types';





const StringSet = require('Set'),
      Heap      = require('heap'),
      dict      = require('dict');





function enforce_config<NodeType>(params: AStarParamType<NodeType>) {

  if (params.start === undefined) {
    throw new Error('Must provide a starting point for the search as `config.start`');
  }

  if (params.isEnd === undefined) {
    throw new Error('Must provide a function evaluating whether a cell is an end point to boolean as `config.isEnd`');
  }

  if (params.neighbor === undefined) {
    throw new Error('Must provide a function returning the neighbors of a cell to node array as `config.neighbor`');
  }

  if (params.distance === undefined) {
    throw new Error('Must provide a function returning the distance between two cells to number as `config.distance`');
  }

  if (params.heuristic === undefined) {
    throw new Error('Must provide a function returning the best-guess no-overestimate of distance-to-end to number as `config.heuristic`');
  }

  const timeout: number = (params.timeout === undefined)
                        ? Number.MAX_SAFE_INTEGER
                        : params.timeout;

  if ( (!( Number.isInteger(timeout) )) || (!( timeout > 0 )) ) {
    throw new Error('Must provide a positive integer or undefined of milliseconds for `config.timeout`');
  }

  const hash = params.hash || defaultHash;

  return {
    timeout, hash
  };

}





function success_result<NodeType>(pathEndpoint: InternalNode<NodeType>) {

  return {
    cost   : pathEndpoint.g,
    status : 'success' as AStarResultStatus,
    path   : reconstructPath(pathEndpoint)
  };

}





function timeout_result<NodeType>(pathEndpoint: InternalNode<NodeType>) {

  return {
    cost   : pathEndpoint.g,
    status : 'timeout' as AStarResultStatus,
    path   : reconstructPath(pathEndpoint)
  };

}





function no_path_result<NodeType>(pathEndpoint: InternalNode<NodeType>) {

  return {
    cost   : pathEndpoint.g,
    status : 'no path' as AStarResultStatus,
    path   : reconstructPath(pathEndpoint)
  };

}





function a_star<NodeType = unknown>(params: AStarParamType<NodeType>): AStarResultType<NodeType> {

  const { timeout, hash } = enforce_config(params);

  const firstHeuristic = params.heuristic(params.start);

  let startNode: InternalNode<NodeType> = {
    data : params.start,
    f    : firstHeuristic,
    g    : 0,
    h    : firstHeuristic,
    // leave .parent undefined
  };

  let bestNode = startNode;

  const closedDataSet = new StringSet(),
        openHeap      = new Heap(heapComparator),
        openDataMap   = dict();

  openHeap.push(startNode);
  openDataMap.set(hash(startNode.data), startNode);

  const startTime = new Date().getTime();



  while (openHeap.size()) {

    if ( (new Date().getTime() - startTime) > timeout) {
      return timeout_result(bestNode);
    }

    var node = openHeap.pop();
    openDataMap.delete(hash(node.data));

    if (params.isEnd(node.data)) { // done
      return success_result(node);
//    return { status: 'success', cost: node.g, path: reconstructPath(node) };
    }

    // not done yet
    closedDataSet.add(hash(node.data));
    var neighbors = params.neighbor(node.data);
    neighbors.forEach( neighborData => {

      if (closedDataSet.contains(hash(neighborData))) {
        // skip closed neighbors
        return;
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

        // skip this one because another route is faster
        if (neighborNode.g < gFromThisNode) { return; }
        else                                { update = true; }

      }

      // found a new or better route.
      // update this neighbor with this node as its new parent
      neighborNode.parent = node;
      neighborNode.g = gFromThisNode;
      neighborNode.h = params.heuristic(neighborData);
      neighborNode.f = gFromThisNode + neighborNode.h;

      if (neighborNode.h < bestNode.h) bestNode = neighborNode;

      if (update) { openHeap.heapify(); }
      else        { openHeap.push(neighborNode); }

    });

  }

  // all the neighbors of every accessible node have been exhausted
  return no_path_result(bestNode);

}





function reconstructPath<NodeType = unknown>(node: InternalNode<NodeType>): NodeType[] {

  if (node.parent !== undefined) {

    const pathSoFar = reconstructPath(node.parent);
    pathSoFar.push(node.data);
    return pathSoFar;

  } else {
    return [node.data];  // this is the starting node
  }

}





function defaultHash<NodeType = unknown>(node: NodeType) {
  return JSON.stringify(node);
}





function heapComparator<NodeType>(a: InternalNode<NodeType>, b: InternalNode<NodeType>) {
  return a.f - b.f;
}





export { a_star };
