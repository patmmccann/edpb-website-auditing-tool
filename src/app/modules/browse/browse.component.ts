/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Analysis } from 'src/app/models/analysis.model';
import { Tag } from 'src/app/models/tag.model';
import { AnalysisService } from 'src/app/services/analysis.service';
import { TagService } from 'src/app/services/tag.service';
import { BrowserService } from 'src/app/services/browser.service';
import { MatBottomSheet, MatBottomSheetConfig, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Card } from 'src/app/models/card.model';
import { LogDetailsComponent } from './log-details/log-details.component';
import { DetailsService } from 'src/app/services/details.service';
import { CardService } from 'src/app/services/card.service';
import { ScreenshotCard } from 'src/app/models/cards/screenshot-card.model';
import { SplitComponent, AngularSplitModule } from 'angular-split';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { NgIf, NgFor } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MatAccordion } from '@angular/material/expansion';
import { CardsComponent } from '../../shared/components/cards/cards.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-browse',
    templateUrl: './browse.component.html',
    styleUrls: ['./browse.component.scss'],
    providers: [SplitComponent],
    imports: [MatToolbar, MatToolbarRow, NgIf, ToolbarComponent, AngularSplitModule, MatAccordion, NgFor, CardsComponent, TranslateModule]
})
export class BrowseComponent implements OnInit, OnDestroy {
  @ViewChild('content') contentElement: ElementRef = new ElementRef({});
  @ViewChild('navToolbar') navToolbarElement: ElementRef = new ElementRef({});

  cards: Card[] = [];
  analysis: Analysis | null = null;
  tag: Tag | null = null;
  browserId: number = 0;
  id: ReturnType<typeof setInterval> | null = null;
  bottomSheetId: MatBottomSheetRef | null = null;
  save_cards: boolean = false;
  canGoBackward: boolean = false;
  canGoForward: boolean = false;
  safeDetailsSubscriber: any = null;
  safeLoadEventSubscriber: any = null;
  logVisible: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private analysisService: AnalysisService,
    private tagService: TagService,
    private browserService: BrowserService,
    private bottomSheet: MatBottomSheet,
    private detailsService: DetailsService,
    private cardService: CardService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {

      const analysisId = parseInt(this.route.snapshot.params['id'], 10);
      const tagId = parseInt(this.route.snapshot.params['tag_id'], 10);


      if (analysisId && tagId) {
        this.analysisService
          .getAnalysisAndTag(analysisId, tagId)
          .then(async (res) => {
            this.analysis = res.analysis;
            this.tag = res.tag;
            this.save_cards = true;
            this.cardService.getAllCards(this.tag.cards)
              .then(cards => {
                this.cards = cards;

                this.browserService
                  .showSession(window, this, this.analysis, this.tag)
                  .then(() => {
                    this.startUpdate();
                  });
              });
          })
      } else {
        this.cards = this.cardService.initCardsBasedOnSetting();
        this.browserService
          .showSession(window, this, this.analysis, this.tag)
          .then(() => {
            this.startUpdate();
          });
      }
    });

    this.safeDetailsSubscriber = this.detailsService.eventDetails.subscribe(() => {
      if (!this.bottomSheetId) {
        this.bottomSheetId = this.bottomSheet.open(LogDetailsComponent,
          {
            panelClass: 'browser-details-position',
            hasBackdrop: false
          });

          this.bottomSheetId.afterDismissed().subscribe(() => {
            this.bottomSheetId = null;
         }); 
      }
    });

    this.safeLoadEventSubscriber = this.browserService.loadEvent.subscribe((event) => {
      (this.navToolbarElement as any).update();
    });

  }
  
  startUpdate(): void {
    this.clearUpdate();
    this.update();
    this.browserService.updateCards(window, this.cards, this.analysis, this.tag);
    this.id = setInterval(async () => {
      this.update();
    }, 1000);
  }

  clearUpdate(): void {
    if (this.id) {
      clearInterval(this.id);
      this.id = null;
    }
  }

  play(): void {
    this.startUpdate();
  }

  pause(): void {
    this.clearUpdate();
  }

  async update() {
    try {
      await this.browserService.updateCards(window, this.cards, this.analysis, this.tag);

      if (this.save_cards) {
        await this.cardService.updateAll(this.cards);
      }

    } catch (e) {
      console.log('error when updating : ' + e);
    }

  }

  ngOnDestroy(): void {
    this.clearUpdate();
    if (this.bottomSheetId){
      this.bottomSheetId.dismiss();
    }

    this.safeDetailsSubscriber?.unsubscribe();
    this.safeLoadEventSubscriber?.unsubscribe();
    this.browserService.hideSession(window);
  }

  async save(): Promise<void> {
    if (this.analysis && this.tag) {
      this.clearUpdate();
      //await this.browserService.updateCards(window, this.cards, this.analysis, this.tag, true);
      //await this.cardService.updateAll(this.cards);
      await this.browserService.deleteSession(window, this.analysis, this.tag);
      this.router.navigate(['analysis', this.analysis.id, 'tag', this.tag.id]);
    }
  }

  erase(): void {
    this.clearUpdate();
    this.browserService
      .eraseSession(window, this.analysis, this.tag);
    this.startUpdate();
  }

  devTool(){
    this.browserService
    .toogleDevTool(window, this.analysis, this.tag);

  }

  screenshot(): void {
    this.browserService.takeScreenshot(window, this.analysis, this.tag, 'visible')
      .then(async (screenShotCard) => {
        if (this.tag) {
          screenShotCard = (await this.tagService.addCard(this.tag, screenShotCard)) as ScreenshotCard;
        }
        this.cards.unshift(screenShotCard);
      });
  }


  toggleLog(value: boolean): void {
    this.logVisible = value;
    window.dispatchEvent(new Event('resize'));
  }

  dragEnd() {
    window.dispatchEvent(new Event('resize'));
  }
}
