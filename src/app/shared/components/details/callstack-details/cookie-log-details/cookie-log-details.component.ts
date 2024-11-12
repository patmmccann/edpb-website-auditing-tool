import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Log } from 'src/app/models/cards/log.model';
import { TranslateService } from '@ngx-translate/core';
import { CookieEvent, CookieLog } from 'src/app/models/cards/cookie-log.model';

interface LogNode {
  name: string;
  children?: LogNode[];
  link:boolean;
}

interface ValueNode {
  name?: string;
  children?: ValueNode[];
  event?: CookieEvent;
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
  @Input() log : CookieLog | undefined;
  event : CookieEvent | null = null;

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
    @Inject(TranslateService) private translateService: TranslateService
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

    if (this.log){
      switch(this.log.type){
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

  createNewTreeLogValue(event:CookieEvent) : ValueNode[]{
    
    const valueNodes = {
      name: this.translateService.instant("browse.log_details.log_values"),
      children:  [{event: event}]
    };
    return [valueNodes];
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.log ){
      this.dataSourceCall.data = this.createNewTreeLogCall(this.log);
      if (this.log.event){
        this.event = this.log.event;
        this.dataSourceValue.data = this.createNewTreeLogValue(this.log.event);
      }
      
    }
  }

  
  ngAfterViewInit() {
    //this.treeLog.treeControl.expand(this.treeLog.treeControl.dataNodes[0]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
