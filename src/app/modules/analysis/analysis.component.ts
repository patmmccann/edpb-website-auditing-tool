/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params, RouterLink } from '@angular/router';
import { Analysis } from 'src/app/models/analysis.model';
import { AnalysisService } from 'src/app/services/analysis.service';
import { Tag } from 'src/app/models/tag.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { DetailsService } from 'src/app/services/details.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { NgIf, NgSwitch, NgSwitchCase, NgFor, DatePipe } from '@angular/common';
import { MatChipListbox, MatChip } from '@angular/material/chips';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { TagsComponent } from './tags/tags.component';
import { ContentComponent } from './content/content.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { DetailsComponent } from '../../shared/components/details/details.component';
import { CallstackDetailsComponent } from '../../shared/components/details/callstack-details/callstack-details.component';
import { KnowledgeBaseComponent } from '../../shared/components/knowledge-base/knowledge-base.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss'],
    imports: [MatToolbar, MatButtonModule, MatToolbarRow, RouterLink, NgIf, MatChipListbox, NgSwitch, NgSwitchCase, MatChip, MatIconModule, MatCard, MatCardTitle, NgFor, MatCardContent, TagsComponent, ContentComponent, MatTabGroup, MatTab, DetailsComponent, CallstackDetailsComponent, KnowledgeBaseComponent, ModalComponent, DatePipe, TranslateModule]
})
export class AnalysisComponent implements OnInit, OnDestroy {
  public analysis: Analysis = new Analysis();
  public evaluation: Evaluation  = new Evaluation();
  
  public activeTag: Tag | null = null;
  public tags: Tag[] = [];
  public showModal = false;

  safeEvaluationSubscriber: any = null;
  safeDeleteTagSubscriber: any = null;

  constructor(
    private route: ActivatedRoute,
    private analysisService: AnalysisService,
    public detailsService:DetailsService,
    public knowledgeBaseService: KnowledgeBaseService
  ) {
  }
  
  
  ngOnDestroy(): void {
    this.safeEvaluationSubscriber?.unsubscribe();
    this.safeDeleteTagSubscriber?.unsubscribe();
  }
;

  async ngOnInit(): Promise<void> {
    this.analysisService
      .find(parseInt(this.route.snapshot.params['id']))
      .then((analysis: Analysis) => {
        this.analysis = analysis;
        this.setupPage();
      })
      .catch((err: Error) => {
        console.error(err);
      });
      this.knowledgeBaseService.knowledgeBaseKind = null;
      this.knowledgeBaseService.knowledgeBaseData = null;
  }


  private async getActiveTagAndCard(tagId: number) {
    this.activeTag = this.tags.filter(x => tagId == x.id)[0];
  }

  setupPage() {
    this.analysisService.getEvaluation(this.analysis)
    .then((evaluation)=>{
      if (evaluation){
        this.evaluation = evaluation;
      }
    });

    this.safeEvaluationSubscriber = this.analysisService.evaluationEvent.subscribe(idx => {
      if (this.analysis.id == idx) {
        this.analysisService.getEvaluation(this.analysis).then((evaluation) => {
          if (evaluation){
            this.evaluation = evaluation;
          }
        });
      }
    });

    this.route.params.subscribe((params: Params) => {
      this.refreshTags();
      window.scroll(0, 0);
    });

    this.safeDeleteTagSubscriber = this.analysisService.deleteTagEvent.subscribe(idx => {
      if (this.analysis.id == idx){
        this.refreshTags();
      }
    });

  }

  refreshTags():void{
    this.analysisService
    .getAllTags(this.analysis)
    .then((tags: Tag[]) => {
      this.tags = tags;
      if (this.route.snapshot.params['tag_id']){
        this.getActiveTagAndCard(parseInt(this.route.snapshot.params['tag_id']));
      }else{
        this.activeTag = null;
      }
    })
    .catch((err: Error) => {
      console.error(err);
    });
  }

}
