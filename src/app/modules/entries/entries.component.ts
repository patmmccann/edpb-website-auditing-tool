/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Analysis } from 'src/app/models/analysis.model';
import { AnalysisService } from 'src/app/services/analysis.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { NewBaseComponent } from './new-base/new-base.component';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Sort } from '@angular/material/sort';
import { TemplateService } from 'src/app/services/template.service';
import { NewTemplateComponent } from './new-template/new-template.component';
import { Template } from 'src/app/models/template.model';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit {
  public type_entries: 'edit' | 'template' | 'knowledgeBase' | 'new' = 'edit' ;
  searchText: string = "";
  public showModal = false;
  importForm: FormGroup = new FormGroup({
    import_file: new FormControl('', [])
  });
  public entries: any[] = [];
  public loading:boolean = false;
  sortOrder: string | null =null;
  sortValue: string | null = null;
  compliant : boolean =false;
  not_compliant : boolean = false;
  tbd :boolean = false;
  not_evaluate : boolean = false;

  constructor(
    private router: Router,
    private el: ElementRef,
    private analysisService: AnalysisService,
    private knowledgeBaseService: KnowledgeBaseService,
    private templateService : TemplateService,
    private dialog: MatDialog
  ) {
    // get entries type (pia or archive)
    switch (this.router.url) {
      case '/entries':
        this.type_entries = 'edit';
        break;
      case '/entries/template':
        this.type_entries = 'template';
        break;
      case '/entries/knowledge_bases':
        this.type_entries = 'knowledgeBase';
        break;
      default:
        break;
    }

  }

  ngOnInit(): void {
    this.refreshContent();
  }

  onCleanSearch(): void {
    this.searchText = '';
  }

  updateEntrie(entry: any): void {
    if (this.entries.includes(entry)) {
      this.entries.forEach(item => {
        if (item.id === entry.id) {
          item = entry;
        }
      });
    }
  }

  /**
   * Go to the new entry route
   */
  onFormsubmitted(id: number, type: string): void {
    this.showModal = false;
    // go to the edit page
    if (type) {
      switch (type) {
        case 'knowledgeBase':
          this.router.navigate(['knowledge_bases', id]);
          break;
        default:
          break;
      }
    }
  }
  
  /**
   * Import a new analysis.
   */
  import(event?: any): void {
    if (event) {
      switch (this.type_entries) {
        case 'knowledgeBase':
          this.loading = true;
          this.knowledgeBaseService
          .import(event.target.files[0])
          .then(() => {
            this.refreshContent();
            this.loading = false;
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
          });
          break;

      }
    } else {
      this.el.nativeElement.querySelector('#import_file').click();
    }
  }

  export_all(event?:any):void{
    const knowledge_bases_promises = this.entries.map( entry => this.knowledgeBaseService.export(entry.id));

    Promise.all(knowledge_bases_promises)
    .then((knowledge_bases)=>{
      const date = new Date().getTime();
      const a = document.getElementById('base-exportBlock');
  
      if (a) {
        const url =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(knowledge_bases));
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          date + '_export_all_knowledgebases.json'
        );
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      }
    })
  }

  /**
   * Refresh the list.
   */
   async refreshContent(): Promise<void> {
    this.loading = true;
    this.entries = [];
    const self = this;
    setTimeout(async () => {
      switch (self.type_entries) {
        case 'edit':
          await self.analysisService.getAllActives().then((entries: Array<Analysis>) => {
            self.entries = entries;
            self.loading = false;
          });
          break;
          case 'knowledgeBase':
            await self.knowledgeBaseService.getAll().then((result: any) => {
              self.entries = result;
              self.loading = false;
              self.sortOrder = localStorage.getItem('knowledgeBaseOrder');
              self.sortValue = localStorage.getItem('knowledgeBaseValue');
            });
            break;
          case 'template':
            await this.templateService.getAll().then((result: any) => {
              self.entries = result;
              self.loading = false;
              self.sortOrder = localStorage.getItem('knowledgeBaseOrder');
              self.sortValue = localStorage.getItem('knowledgeBaseValue');
            });
            break;
        default:
          break;
      }
    }, 200);
   }

  setLocalStorageOrderValue(): void {

  }

  openNewKnowledgeDialog(): void {
    const dialogRef = this.dialog.open(NewBaseComponent, {
      width: '300px',
      data: {category:'cookie'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const newKnowledgeBase = new KnowledgeBase(
        0,
        result.name, 
        result.author, 
        result.category,
        new Date(),
        result.trustLevel,
        result.used
      );
      
      this.knowledgeBaseService.create(newKnowledgeBase)
      .then(async (base: KnowledgeBase) => {
        this.router.navigate(['knowledge_bases', base.id]);
      });
    });
  }

  openNewTemplateDialog(): void {
    const dialogRef = this.dialog.open(NewTemplateComponent, {
      width: '300px',
      data: {name:'',author:'', pug:null},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.templateService
      .create(result)
      .then(async (template_id: Template) => {
        this.refreshContent();
        //this.router.navigate(['template',template_id]);
      });
    });
  }
}
