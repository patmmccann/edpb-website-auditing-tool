/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Card, viewContext } from 'src/app/models/card.model';
import { ScreenshotCard } from 'src/app/models/cards/screenshot-card.model';
import { Tag } from 'src/app/models/tag.model';
import { BrowserService, ScreenshotOptions } from 'src/app/services/browser.service';
import { TagService } from 'src/app/services/tag.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { LoadingOverlayComponent } from '../../loading-overlay/loading-overlay.component';
import { TranslateModule } from '@ngx-translate/core';
import { SafeImgPipe } from '../../../../pipes/tools.pipe';

@Component({
    selector: 'app-screenshot-card',
    templateUrl: './screenshot-card.component.html',
    styleUrls: ['./screenshot-card.component.scss'],
    imports: [MatFormField, MatLabel, MatSelect, MatOption, LoadingOverlayComponent, TranslateModule, SafeImgPipe]
})
export class ScreenshotCardComponent implements OnInit {
  screenshotCard: ScreenshotCard = new ScreenshotCard("");
  @Input() context: viewContext = 'evaluate';
  @Input() card: Card | null = null;
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
  
  screenshot_option : ScreenshotOptions = 'visible';
  loading :boolean = false;
  constructor(
    private browserService: BrowserService,
    private tagService : TagService
  ) { }

  ngOnInit(): void {
    if (this.card){
      this.screenshotCard = <ScreenshotCard>this.card;
    }
  }

  updateScreenshot(){
    if (this.analysis && this.tag){
      this.loading = true;
      this.browserService.takeScreenshot(window, this.analysis, this.tag, this.screenshot_option)
      .then(async (screenShotCard) => {
        if (this.tag){
          this.tagService.removeCard(this.tag, this.screenshotCard);
          screenShotCard = (await this.tagService.addCard(this.tag, screenShotCard)) as ScreenshotCard;
          this.screenshotCard = screenShotCard;
          this.loading = false;
        }
      });
    }
  }
}
