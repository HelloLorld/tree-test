export interface TreeNode {
    name: string;
    children?: TreeNode[];
}


export type Tree = TreeNode[];

export interface TreeNodeWithLevel extends Omit<TreeNode, "children"> {
    children?: TreeNodeWithLevel[];
    level: number;
}