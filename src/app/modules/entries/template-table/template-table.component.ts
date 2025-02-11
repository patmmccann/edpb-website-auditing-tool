/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Sort, MatSort, MatSortHeader } from '@angular/material/sort';
import { TemplateService } from 'src/app/services/template.service';
import { Template } from 'src/app/models/template.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-template-table',
    templateUrl: './template-table.component.html',
    styleUrls: ['./template-table.component.scss'],
    imports: [MatSort, MatSortHeader, TranslateModule]
})
export class TemplateTableComponent implements OnInit {

  @Output() changed = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<any>();

  @Input() entries:any[]=[];

  constructor(
    private templateService: TemplateService
  ) { }

  ngOnInit(): void {

  }
  
  onFocusOut(template: Template, attribute: string, event: any): void {
    const text = event.target.innerText;
    (template as any)[attribute] = text;
    this.templateService
      .update(template)
      .then(() => {
        this.changed.emit(template);
      })
      .catch(err => {
        console.error(err);
      });
  }

  remove(id:number): void {
    this.templateService
    .delete(id)
    .then(() => {
      this.deleted.emit();
    })
    .catch(() => {
      return;
    });
  }

  export(id:number): void {
    this.templateService.export(id);
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
          default:
            return 0;
        }
      });
    }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}