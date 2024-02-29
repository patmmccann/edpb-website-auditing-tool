/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnInit } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { viewContext } from 'src/app/models/card.model';
import { Tag } from 'src/app/models/tag.model';
import { Card } from 'src/app/models/card.model';
import { CardService } from 'src/app/services/card.service';
import { BrowserService } from 'src/app/services/browser.service';
import { TestSSLCard } from 'src/app/models/cards/test-sslcard.model';
import { Evaluation, Status } from 'src/app/models/evaluation.model';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  @Input() context: viewContext = 'evaluate';
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
  @Input() card: Card = new Card("","");
  @Input() evaluation : Evaluation = new Evaluation();
  editing : boolean = false;
  searchStatus :Status[]= [];
  searchCookie = {};
  searchLocalStorage = {};
  searchBeacon = {};

  constructor(
    public cardService : CardService,
    public settingService : SettingsService,
    private browserService: BrowserService
  ) { }

  ngOnInit(): void {

    if (this.card && this.context== 'evaluate'){
      this.cardService.getEvaluation(this.card)
      .then(evaluation=>{
        if (evaluation) this.evaluation = evaluation;
      })
    }

  }
  
  runCard():void{
    if (this.card.kind == 'testSSL'){
      this.browserService.launchTestSSL(window, this.card as TestSSLCard, this.analysis, this.tag);
    }
  }

  edit(event:Event):void{
    this.editing = true;
    event.stopPropagation();
  }
  
  onKeyDownEvent(e: any) {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      const { value } = e.currentTarget;
      this.editing = false;
      this.cardService.update(this.card);
    }
  }


  onMouseDown(e: any) {
    e.stopPropagation();
    e.currentTarget.select();
  };


    /**
   * Change evaluation.
   * @param evaluation - Any Evaluation.
   */
     evaluationChange(evaluation: Evaluation): void {
      if (this.card){
        
        this.cardService.setEvaluation(this.card, evaluation);
        this.evaluation = evaluation;
      }
    }

}
