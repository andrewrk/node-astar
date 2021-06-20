
type AStarParamType<NodeType> = {
  start     : NodeType,
  isEnd     : (node: NodeType) => boolean,
  neighbor  : (node: NodeType) => NodeType[],
  distance  : (left: NodeType, right: NodeType) => number,
  heuristic : (node: NodeType) => number,
  hash?     : (node: NodeType) => string,
  timeout?  : number
};

type AStarResultStatus = 'success' | 'no path' | 'timeout';

type AStarResultType<NodeType> = {
  status : AStarResultStatus,
  path   : NodeType[],
  cost   : number
};

type InternalNode<NodeType> = {
  data    : NodeType,
  f       : number,
  g       : number,
  h       : number,
  parent? : InternalNode<NodeType>
};





export{ AStarParamType, AStarResultType, AStarResultStatus, InternalNode };

