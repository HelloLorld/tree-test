import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";

import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import { Tree, TreeNode, TreeNodeWithLevel } from "../models/tree.model";
// import { treeExample } from "../data/test.data";
import { FlatTreeControl } from "@angular/cdk/tree";
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from "@angular/common";

@Component({
    selector: "tree",
    styleUrl: "./tree.component.less",
    templateUrl: "./tree.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatTreeModule,
        MatButtonModule,
        MatIconModule,
        CommonModule,
    ],
})
export class TreeComponent {
    private getLevel = (node: TreeNodeWithLevel) => node.level;
    public expandable = (node: TreeNodeWithLevel) => !!node.children?.length;
    private getChildren = (node: TreeNodeWithLevel) => node.children as TreeNodeWithLevel[] ?? [];

    private transformer = (node: TreeNodeWithLevel, level: number) => {
        return node;
    };

    public treeControl = new FlatTreeControl<TreeNodeWithLevel>( this.getLevel, this.expandable);
    public treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.expandable, this.getChildren);
    public dataSource: MatTreeFlatDataSource<TreeNode, TreeNodeWithLevel> = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    
    
    private data: Tree = [];

    constructor(
        private cdr: ChangeDetectorRef,
    ) {}

    loadData(event: MouseEvent) {
        event.stopPropagation();
        import("../data/test.data").then((testData) => {
            this.data = [...testData.treeExample];
            this.dataSource.data = this.data.map((node) => {
                const levelUp = (parent: TreeNodeWithLevel, node: TreeNodeWithLevel) => {
                    node.level = parent.level + 1;
                    node.children?.forEach((child) => levelUp(node, child as TreeNodeWithLevel));
                };
                (node as TreeNodeWithLevel).level = 0;
                node.children?.forEach((child) => levelUp(node as TreeNodeWithLevel, child as TreeNodeWithLevel));
                return node;
            });
            this.treeControl.collapseAll();
        });
    }

    onAddClick(event: MouseEvent, node: TreeNodeWithLevel) {
        event.stopPropagation();
        const name = window.prompt("Enter new name");
        if (name) {
            node.children = [...node.children ?? [], {name, level: node.level + 1, children: []}]
            this.dataSource.data = this.data;
            this.treeControl.expand(node);
            this.cdr.markForCheck();
        }
    }

    onDeleteClick(event: MouseEvent, node: TreeNodeWithLevel) {
        event.stopPropagation();
        if (node.level === 0) {
            const index = this.data.findIndex((n) => n === node);
            index !== -1 && this.data.splice(index, 1);
        } else {
            const path = this.findPathForNode(node);
            const pathLength = path.length;
            const index = path[pathLength - 2].children?.findIndex((n) => n === node) ?? -1;
            index !== -1 && path[pathLength - 2].children?.splice(index, 1);
        }
        this.dataSource.data = this.data;
        this.treeControl.expand(node);
        this.cdr.markForCheck();
    }

    logPathForNode(event: MouseEvent, node: TreeNodeWithLevel): void {
        event.stopPropagation();
        const path = this.findPathForNode(node);
        console.log(path.map((n) => n.name).join(" > "));
    }

    findPathForNode(node: TreeNodeWithLevel): TreeNodeWithLevel[] {
        const _findPathForNode = (_node: TreeNodeWithLevel, path: TreeNodeWithLevel[]): TreeNodeWithLevel[] => {
            if (_node === node) {
                path.push(_node);
                return path;
            }
            if (_node.children?.length) {
                for (const child of _node.children) {
                    const found = _findPathForNode(child, path);
                    if (found.length) {
                        path.push(_node);
                        return path;
                    }
                }
            }
            return [];
        };

        let path: TreeNodeWithLevel[] = [];
        for (const node of this.data) {
            path = _findPathForNode(node as TreeNodeWithLevel, []);
            if (path.length) {
                path.reverse();
                break;
            }
        }
        return path;
    }
}