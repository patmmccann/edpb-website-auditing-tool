/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { SettingsService } from 'src/app/services/settings.service';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-knowledge-cookie-item',
    templateUrl: './knowledge-cookie-item.component.html',
    styleUrls: ['./knowledge-cookie-item.component.scss'],
    imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIconModule, MatTooltipModule, TranslateModule]
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
