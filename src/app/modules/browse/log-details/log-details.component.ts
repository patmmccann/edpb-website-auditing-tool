/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { DetailsService } from 'src/app/services/details.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { SettingsService } from 'src/app/services/settings.service';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DetailsComponent } from '../../../shared/components/details/details.component';
import { CallstackDetailsComponent } from '../../../shared/components/details/callstack-details/callstack-details.component';
import { KnowledgeBaseComponent } from '../../../shared/components/knowledge-base/knowledge-base.component';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-log-details',
    templateUrl: './log-details.component.html',
    styleUrls: ['./log-details.component.scss'],
    imports: [MatTabGroup, NgIf, MatTab, MatTabLabel, MatIcon, MatTooltip, DetailsComponent, CallstackDetailsComponent, KnowledgeBaseComponent, MatButton, TranslateModule]
})
export class LogDetailsComponent implements OnInit, OnDestroy {

  constructor(
    public settingService: SettingsService,
    public detailsService: DetailsService,
    public knowledgeBaseService: KnowledgeBaseService,
    private bottomSheetRef: MatBottomSheetRef<LogDetailsComponent>
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.detailsService.detailsData = null;
  }
  
  closeBottomSheet() {
    this.bottomSheetRef.dismiss();
  }
}
