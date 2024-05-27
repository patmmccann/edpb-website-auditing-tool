/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { KnowledgeBase, allTrustLevel,TrustLevel } from 'src/app/models/knowledgeBase.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { Sort } from '@angular/material/sort';


@Component({
  selector: 'app-knowledgebase-table',
  templateUrl: './knowledgebase-table.component.html',
  styleUrls: ['./knowledgebase-table.component.scss']
})
export class KnowledgebaseTableComponent implements OnInit {

  @Output() changed = new EventEmitter<any>();
  @Output() duplicated = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<any>();

  @Input() entries:any[]=[];
  allTrustLevel = allTrustLevel;

  constructor(
    private knowledgeBaseService: KnowledgeBaseService
  ) { }

  ngOnInit(): void {

  }
  
  onFocusOut(base: KnowledgeBase, attribute: string, event: any): void {
    const text = event.target.innerText;
    (base as any)[attribute] = text;
    this.knowledgeBaseService
      .update(base)
      .then(() => {
        this.changed.emit(base);
      })
      .catch(err => {
        console.error(err);
      });
  }

  remove(id:number): void {
    this.knowledgeBaseService
    .delete(id)
    .then(() => {
      this.deleted.emit();
    })
    .catch(() => {
      return;
    });
  }

  export(id:number): void {
    this.knowledgeBaseService
    .export(id)
    .then((data)=>{
      const date = new Date().getTime();
      
      const a = document.getElementById('base-exportBlock');
  
      if (a) {
        const url =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(data));
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          date + '_export_knowledgebase_' + id + '.json'
        );
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      }
    })
  }

  duplicate(id:number): void {
    this.knowledgeBaseService.duplicate(id);
    this.duplicated.emit();
  }

  updateTrust(base:KnowledgeBase, trustLevel : TrustLevel): void {
    base.trustLevel = trustLevel;
    this.knowledgeBaseService.update(base);
  }

  updateUsed(base:KnowledgeBase, used : boolean): void {
    base.used = used;
    this.knowledgeBaseService.update(base);
  }

    /**
   * Asort items created on PIA.
   */
     sortBy(sort: Sort): void {

      this.entries = this.entries.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'name':
            return compare(a.name, b.name, isAsc);
          case 'author':
            return compare(a.author, b.author, isAsc);
          case 'category':
            return compare(a.category, b.category, isAsc);
          case 'knowledges':
            return compare(a.knowledges, b.knowledges, isAsc);
          case 'trust':
            return compare(a.trust, b.trust, isAsc);
          case 'used':
            return compare(a.used, b.used, isAsc);
          default:
            return 0;
        }
      });
    }
}


function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}