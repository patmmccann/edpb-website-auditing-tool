/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input, OnChanges,SimpleChanges, ElementRef, Output, EventEmitter } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Tag } from 'src/app/models/tag.model';
import { AnalysisService } from 'src/app/services/analysis.service';
import { TagService } from 'src/app/services/tag.service';
import { CardService } from 'src/app/services/card.service';
import { Router } from '@angular/router';
import { Evaluation } from 'src/app/models/evaluation.model';
import { GlobalCard } from 'src/app/models/cards/global-card.model';
import { Card,allKindCard } from 'src/app/models/card.model';
import { Sort } from '@angular/material/sort';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { BrowserService } from 'src/app/services/browser.service';

@Component({
  selector: 'app-global-card',
  templateUrl: './global-card.component.html',
  styleUrls: ['./global-card.component.scss']
})
export class GlobalCardComponent implements OnInit,OnChanges {
  @Input() card: GlobalCard | null = null;
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
  @Input() evaluation : Evaluation = new Evaluation();
  @Output() deleted = new EventEmitter();
  all_cards: {card :Card, evaluation : Evaluation | null}[] = [];
  all_tags: {tag :Tag, evaluation : Evaluation| null}[] = [];
  

  constructor(
    private analysisService: AnalysisService,
    private tagService: TagService,
    private cardService: CardService,
    private browserService:BrowserService
  ) { }

  ngOnInit(): void {

  }

  /**
   * Change evaluation.
   * @param evaluation - Any Evaluation.
   */
  evaluationChange(evaluation: Evaluation): void {
    if (this.tag){
      this.tagService.setEvaluation(this.tag, evaluation)
      .then((evaluation)=>{
        this.evaluation = evaluation;
      });
      
    } else if (this.analysis){
      this.analysisService.setEvaluation(this.analysis, evaluation)
      .then((evaluation)=>{
        this.evaluation = evaluation;
      });
    } 
  }

  deleteCard(card:Card): void {
    if (this.tag) {
      this.tagService.removeCard(this.tag, card)
        .then(tag => {
          this.refreshCardEvaluationList();
          this.deleted.emit();
        });
    }
  }

  deleteTag(tag:Tag): void {
    if (this.analysis) {
      this.analysisService.removeTag(this.analysis, tag)
        .then(() => {
          if (this.analysis){
            this.browserService.deleteSession(window, this.analysis, tag);
          }
          this.refreshTagEvaluationList();
        });
    }
  }

  scroll(card:Card): void {
    const panels = document.querySelectorAll('mat-expansion-panel');
    [].forEach.call(panels, (el:any, i:number) => {
      if (el.id === card.name) {
        el.scrollIntoView();
      }
    });
  }

  refreshCardEvaluationList(){
    if (this.tag){
      this.tagService
      .getAllCardsWithEvaluation(this.tag, allKindCard)
      .then((cards)=>{
        this.all_cards = cards;
      })
    }
  }

  async refreshTagEvaluationList():Promise<void>{
    if (this.analysis){
      this.analysisService
      .getAllTagsWithEvaluation(this.analysis)
      .then((tags)=>{
        this.all_tags = tags;
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tag){
      this.all_cards = [];
      this.tagService.getEvaluation(this.tag).then((evaluation) =>{
        if(evaluation) {
          this.evaluation = evaluation
        }else{
          this.evaluation = new Evaluation();
        }
      });

      this.refreshCardEvaluationList();

      this.cardService.evaluationEvent.subscribe(id=>{
        const idx = this.all_cards.findIndex(x => x.card.id = id);
        if(idx > -1) this.refreshCardEvaluationList();
      });


    } else if (this.analysis){
      this.all_cards = [];
      this.analysisService
      .getEvaluation(this.analysis)
        .then((evaluation) =>{
          if(evaluation) this.evaluation = evaluation;
      });

      this.refreshTagEvaluationList();

    } 
  }


  sortCardData(sort: Sort) {
    this.all_cards = this.all_cards.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.card.name, b.card.name, isAsc);
        case 'evaluation':
          const evaluation_a = a.evaluation? a.evaluation.status :"";
          const evaluation_b = b.evaluation? b.evaluation.status :"";
          return compare(evaluation_a, evaluation_b, isAsc);
        default:
          return 0;
      }
    });
  }

  sortTagData(sort: Sort) {
    this.all_tags = this.all_tags.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'scenario':
          return compare(a.tag.name, b.tag.name, isAsc);
        case 'evaluation':
          const evaluation_a = a.evaluation? a.evaluation.status :"";
          const evaluation_b = b.evaluation? b.evaluation.status :"";
          return compare(evaluation_a, evaluation_b, isAsc);
        default:
          return 0;
      }
    });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}