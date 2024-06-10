import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CookieLogEvent } from 'src/app/models/cards/log-event.model';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Log } from 'src/app/models/cards/log.model';
import { TranslateService } from '@ngx-translate/core';

interface LogNode {
  name: string;
  children?: LogNode[];
  link:boolean;
}

interface ValueNode {
  name?: string;
  children?: ValueNode[];
  event?: CookieLogEvent;
}


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  link:boolean;
}

@Component({
  selector: 'app-cookie-log-details',
  templateUrl: './cookie-log-details.component.html',
  styleUrls: ['./cookie-log-details.component.scss']
})
export class CookieLogDetailsComponent implements OnInit , OnChanges {
  @Input() event : CookieLogEvent | undefined;

  @ViewChild('treeLogCall') treeLogCall: any = null;
  dataSourceCall : MatTreeFlatDataSource<LogNode, FlatNode>;
  dataSourceValue : MatTreeFlatDataSource<ValueNode, FlatNode>;
  
  
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
    this.dataSourceValue = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
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
    
    let name = "";

    if (this.event){
      switch(this.event.type){
        case "Cookie.HTTP":
          name = this.translateService.instant("browse.log_details.log_cookie_http");
          break;

        case "Cookie.JS":
          name = this.translateService.instant("browse.log_details.log_cookie_js");
          break;
      }
    }

    const logNode = {
      name: name,
      children: logNodes,
      link:false
    };
    return [logNode];
  }

  createNewTreeLogValue(event:CookieLogEvent) : ValueNode[]{
    const eventNodes:ValueNode[] = [];
    
    const valueNodes = {
      name: this.translateService.instant("browse.log_details.log_values"),
      children:  [{event: event}]
    };
    return [valueNodes];
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.event && this.event.log){
      this.dataSourceCall.data = this.createNewTreeLogCall(this.event.log);
      this.dataSourceValue.data = this.createNewTreeLogValue(this.event);
    }
  }

  
  ngAfterViewInit() {
    //this.treeLog.treeControl.expand(this.treeLog.treeControl.dataNodes[0]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
