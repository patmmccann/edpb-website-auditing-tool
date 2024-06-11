import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Log } from 'src/app/models/cards/log.model';
import { TranslateService } from '@ngx-translate/core';
import { RequestTrackingEvent, RequestTrackingLog } from 'src/app/models/cards/request-tracking-log.model';

interface LogNode {
  name: string;
  children?: LogNode[];
  link:boolean;
}

interface ValueNode {
  name?: string;
  children?: ValueNode[];
  event?: RequestTrackingEvent;
}


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  link:boolean;
}

@Component({
  selector: 'app-request-tracking-details',
  templateUrl: './request-tracking-details.component.html',
  styleUrls: ['./request-tracking-details.component.scss']
})
export class RequestTrackingDetailsComponent implements OnInit , OnChanges {
  @Input() log : RequestTrackingLog | undefined;
  event : RequestTrackingEvent| null = null;

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

    this.dataSourceValue = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  createNewTreeLogValue(event:RequestTrackingEvent) : ValueNode[]{
    
    const valueNodes = {
      name: this.translateService.instant("browse.log_details.log_beacon"),
      children:  [{event: event}]
    };
    return [valueNodes];
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (this.log && this.log.event){
      this.event = this.log.event;
      this.dataSourceValue.data = this.createNewTreeLogValue(this.log.event);
    }
  }

  
  ngAfterViewInit() {
    //this.treeLog.treeControl.expand(this.treeLog.treeControl.dataNodes[0]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
