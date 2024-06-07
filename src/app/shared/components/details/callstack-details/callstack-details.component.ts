/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, Input, OnChanges, OnInit,SimpleChanges,ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Log } from 'src/app/models/cards/log.model';


 interface LogNode {
  name: string;
  children?: LogNode[];
  link:boolean;
}


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  link:boolean;
}

@Component({
  selector: 'app-callstack-details',
  templateUrl: './callstack-details.component.html',
  styleUrls: ['./callstack-details.component.scss']
})
export class CallstackDetailsComponent implements OnInit, OnChanges {
  @ViewChild('treeLog') treeLog: any = null;

  @Input() log:Log |  undefined = undefined;
  dataSource : MatTreeFlatDataSource<LogNode, FlatNode>;

  private _transformer = (node: LogNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      link: node.link
    };
  };

  treeControl : FlatTreeControl<FlatNode>;

  treeFlattener : MatTreeFlattener<LogNode, FlatNode>;
  
  constructor() {
    this.treeControl = new FlatTreeControl<FlatNode>(
      node => node.level,
      node => node.expandable,
    );
  
    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children,
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  createNewTreeLog(log:Log) : LogNode[]{
    const logNodes:LogNode[] = [];

    if ((log as any).stack){
      // Fix for Wec
      log.stacks = (log as any).stack;
    }

    for (let stack of log.stacks){

      if (!stack.fileName) continue;
      const children:LogNode[] = [];

      if (stack.functionName){
        children.push({name:"By function : "+ stack.functionName.toString() +"()",children:[], link:false})
      }

      if (stack.columnNumber){
        children.push({name:"At column :" + stack.columnNumber.toString(),children:[], link:false})
      }
      if (stack.lineNumber){
        children.push({name:"And line : "+ stack.lineNumber.toString(),children:[], link:false})
      }

      if (stack.request){
        children.push({name:`Request details :`, link:false});
        children.push({name:`Creation :  ${stack.request.creation}`, link:false});
        children.push({name:`Domain :  ${stack.request.domain}`, link:false});
        children.push({name:`Expires :  ${stack.request.expires}`, link:false});
        children.push({name:`httpOnly :  ${stack.request.httpOnly}`, link:false});
        children.push({name:`Key :  ${stack.request.key}`, link:false});
        children.push({name:`Path :  ${stack.request.path}`, link:false});
        children.push({name:`Secure :  ${stack.request.secure}`, link:false});
        children.push({name:`Value :  ${stack.request.value}`, link:false});
      }

      

      logNodes.push({name:stack.fileName, children:children, link:true});
    }
    
    let name = "";

    switch(log.type){
      case "Cookie.JS":
        name = "Javascript cookie set from the following javascript file";
        break;
      case "Cookie.HTTP":
        name = "Request cookie set by a SetCookie on the following request";
        break;

      case "Storage.LocalStorage":
        name = "Local Storage value written from the following files"
        break;
      default:
        name = "Source"
        break;
    }

    const logNode = {
      name: name,
      children: logNodes,
      link:false
    };
    return [logNode];
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.log){
      this.dataSource.data = this.createNewTreeLog(this.log);
    }
    
  }

  
  ngAfterViewInit() {
    //this.treeLog.treeControl.expand(this.treeLog.treeControl.dataNodes[0]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
  
}
