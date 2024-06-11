import { StorageLocalStorageLogEvent } from 'src/app/models/cards/log-event.model';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Log } from 'src/app/models/cards/log.model';
import { TranslateService } from '@ngx-translate/core';

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
  selector: 'app-storage-local-storage-details',
  templateUrl: './storage-local-storage-details.component.html',
  styleUrls: ['./storage-local-storage-details.component.scss']
})
export class StorageLocalStorageDetailsComponent implements OnInit , OnChanges {
  @Input() event : StorageLocalStorageLogEvent | undefined;

  @ViewChild('treeLogCall') treeLogCall: any = null;
  dataSourceCall : MatTreeFlatDataSource<LogNode, FlatNode>;
  
  
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
  
  constructor(
    private translateService: TranslateService
  ) {
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

    this.dataSourceCall = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  createNewTreeLogCall(log:Log) : LogNode[]{
    const logNodes:LogNode[] = [];

    if ((log as any).stack){
      // Fix for Wec
      log.stacks = (log as any).stack;
    }

    for (let stack of log.stacks){

      if (!stack.fileName) continue;
      const children:LogNode[] = [];
      let js_messages = [];

      if (stack.functionName){
        js_messages.push( this.translateService.instant("browse.log_details.by_function")+ " "+ stack.functionName.toString() +"()");
      }

      if (stack.columnNumber){
        js_messages.push( this.translateService.instant("browse.log_details.at_column") + " " + stack.columnNumber.toString());
      }
      if (stack.lineNumber){
        js_messages.push( this.translateService.instant("browse.log_details.and_line") + " "+ stack.lineNumber.toString());
      }

      if (js_messages.length >0 ){
        children.push({name:js_messages.join(' ')+ ".",children:[], link:false})
      }
   
      logNodes.push({name:stack.fileName, children:children, link:true});
    }
    

    const logNode = {
      name: this.translateService.instant("browse.log_details.log_localstorage"),
      children: logNodes,
      link:false
    };
    return [logNode];
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (this.event && this.event.log){
      this.dataSourceCall.data = this.createNewTreeLogCall(this.event.log);
    }
  }

  
  ngAfterViewInit() {
    //this.treeLog.treeControl.expand(this.treeLog.treeControl.dataNodes[0]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
