// Type definitions for a-star 0.2
// Project: https://github.com/superjoe30/node-astar
// Definitions by: John Haugeland <https://github.com/StoneCypher>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

type AStarParamType<NodeType> = {
  start     : NodeType,
  isEnd     : (node: NodeType) => boolean,
  neighbor  : (node: NodeType) => NodeType[],
  distance  : (left: NodeType, right: NodeType) => number,
  heuristic : (node: NodeType) => number,
  hash?     : (node: NodeType) => string,
  timeout?  : number
};

type AStarResultType<NodeType> = {
  status : 'success' | 'noPath' | 'timeout',
  path   : NodeType[]
};

declare function a_star<NodeType = unknown>(params: AStarParamType<NodeType>): AStarResultType<NodeType>;

export = a_star;
