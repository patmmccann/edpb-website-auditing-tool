/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { CookieSearch } from 'src/app/services/knowledges/cookie-knowledges.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { SettingsService } from 'src/app/services/settings.service';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-knowledge-cookie-item',
    templateUrl: './knowledge-cookie-item.component.html',
    styleUrls: ['./knowledge-cookie-item.component.scss'],
    imports: [NgFor, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, NgClass, NgIf, MatIcon, MatTooltip, TranslateModule]
})
export class KnowledgeCookieItemComponent implements OnInit, OnChanges {

  @Input() knowledgeBaseData: any[] | null = null;

  public knowledgeBases: { [key: number]: KnowledgeBase } = {};

  constructor(
    public settingService : SettingsService
  ) { }

  ngOnChanges(changes: SimpleChanges) {

  }
  
  ngOnInit(): void {
    
  }

}
