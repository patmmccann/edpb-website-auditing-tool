/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, EventEmitter, OnInit, Input, Output, ElementRef, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Analysis } from 'src/app/models/analysis.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { CookieKnowledge } from 'src/app/models/knowledges/cookie-knowledge.model';
import { LocalStorageKnowledge } from 'src/app/models/knowledges/localstorage-knowledge.model';
import { Tag } from 'src/app/models/tag.model';
import { DetailsService } from 'src/app/services/details.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { CookieKnowledgesService } from 'src/app/services/knowledges/cookie-knowledges.service';
import { LocalstorageKnowledgesService } from 'src/app/services/knowledges/localstorage-knowledges.service';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { KnowledgeCookieItemComponent } from './knowledge-cookie-item/knowledge-cookie-item.component';
import { KnowledgeLocalstorageItemComponent } from './knowledge-localstorage-item/knowledge-localstorage-item.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-knowledge-base',
    templateUrl: './knowledge-base.component.html',
    styleUrls: ['./knowledge-base.component.scss'],
    imports: [MatAccordion, KnowledgeCookieItemComponent, KnowledgeLocalstorageItemComponent, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, TranslateModule]
})
export class KnowledgeBaseComponent implements OnInit, OnChanges, OnDestroy {

  @Input() item: any;
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
  @Input() context : 'browser' | 'analysis' = 'analysis';

  customKnowledgeBases: KnowledgeBase[] = [];
  selectedKnowledBase: string = "";
  categories: string[] = ["Targeted advertising", "Non-Targeted advertising", "Technical", "Analytics (exempted)", "Analytics (non exempted)", "Social media", "Content customisation", "?"];

  @ViewChild('selectedknowbase') selectedknowbaseElement: ElementRef = new ElementRef({});

  entryForm: FormGroup = new FormGroup({
    category: new FormControl(),
    domain: new FormControl(),
    key:new FormControl(),
    script:new FormControl(),
    name: new FormControl(),
    source: new FormControl(),
    controller: new FormControl(),
    policy: new FormControl(),
    reference: new FormControl(),
    comment: new FormControl()
  });

  constructor(
    private route: ActivatedRoute,
    public knowledgeBaseService: KnowledgeBaseService,
    private cookieKnowledgesService: CookieKnowledgesService,
    private localStorageKnowledgeService:LocalstorageKnowledgesService,
    private detailsService: DetailsService,
    private el: ElementRef,
    private router: Router
  ) { }

  ngOnInit(): void {
      // INIT
      const knowledgeIdentifier = this.analysis
      ? 'analysis_' + this.route.snapshot.params['id'] + '_knowledgebase'
      : null;

      if (knowledgeIdentifier != null){
        this.loadKnowledgesBase().then(() => {
          const selectedKnowledBase = localStorage.getItem(knowledgeIdentifier);
    
          if (selectedKnowledBase != null){
            this.selectedKnowledBase = selectedKnowledBase
          }else{
            this.selectedKnowledBase = "0";
          }
          
        });
      }else{
        this.selectedKnowledBase = "0";
        
      }

      this.detailsService.eventDetails.subscribe(()=>{
        this.loadSelectedValues();
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && changes['item'].currentValue) {
      this.knowledgeBaseService.loadByItem(this.item);
    }
  }

  ngOnDestroy(): void {
    this.knowledgeBaseService.knowledgeBaseData = null;
    this.knowledgeBaseService.knowledgeBaseKind = null;
  }

  /**
   * Load the knowledges List
   */
  loadKnowledgesBase(): Promise<any> {
    return new Promise((resolve, reject) => {
      // LOAD CUSTOM KNOWLEDGE BASE
      this.knowledgeBaseService
        .getAll()
        .then((result: any) => {
          if (result) {
            this.customKnowledgeBases = [
              ...this.customKnowledgeBases,
              ...result
            ];
          }
          resolve(this.customKnowledgeBases);
        })
        .catch(() => {
          reject();
        });
    });
  }


  /**
   * New knowledge base search query.
   */
  onSubmit(): void {
    const baseid = (this.selectedknowbaseElement as any).value

    let entry : any = null;
    if (this.knowledgeBaseService.knowledgeBaseKind == 'cookie'){
      entry = new CookieKnowledge();
      entry.domain = this.entryForm.value.domain;
      entry.name = this.entryForm.value.name;
      entry.source = this.entryForm.value.source;
      entry.controller = this.entryForm.value.controller;
      entry.policy = this.entryForm.value.policy;
      entry.category = this.entryForm.value.category;
      entry.reference = this.entryForm.value.reference;
      entry.comment = this.entryForm.value.comment;
      entry.created_at = new Date();
      entry.updated_at = entry.created_at;
      this.cookieKnowledgesService
      .add(baseid, entry)
      .then(()=>{
        this.knowledgeBaseService.knowledgeBaseData?.name_and_domain.push(entry);
      })
    }else if (this.knowledgeBaseService.knowledgeBaseKind == 'localstorage'){
      entry = new LocalStorageKnowledge();
      entry.key = this.entryForm.value.key;
      entry.script = this.entryForm.value.script;
      entry.source = this.entryForm.value.source;
      entry.controller = this.entryForm.value.controller;
      entry.policy = this.entryForm.value.policy;
      entry.category = this.entryForm.value.category;
      entry.reference = this.entryForm.value.reference;
      entry.comment = this.entryForm.value.comment;
      entry.created_at = new Date();
      entry.updated_at = entry.created_at;
      this.localStorageKnowledgeService
      .add(baseid, entry).then(()=>{
        this.knowledgeBaseService.knowledgeBaseData?.push(entry);
      })
    }else{
      throw new Error();
    }
  }

  switch(selectedKnowledBase: string): void {
    localStorage.setItem(
      'analysis_' + this.route.snapshot.params['id'] + '_knowledgebase',
      selectedKnowledBase
    );
  }

  loadSelectedValues(){
    this.entryForm.controls['domain'].setValue(this.knowledgeBaseService.knowledgeBaseSource.domain);
    this.entryForm.controls['name'].setValue(this.knowledgeBaseService.knowledgeBaseSource.name);
    this.entryForm.controls['key'].setValue(this.knowledgeBaseService.knowledgeBaseSource.key);
    this.entryForm.controls['script'].setValue(this.knowledgeBaseService.knowledgeBaseSource.script);
  }
}
