/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnInit } from '@angular/core';
import { LocalStorageKnowledge } from 'src/app/models/knowledges/localstorage-knowledge.model';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
    selector: 'app-knowledge-localstorage-item',
    templateUrl: './knowledge-localstorage-item.component.html',
    styleUrls: ['./knowledge-localstorage-item.component.scss'],
    standalone: false
})
export class KnowledgeLocalstorageItemComponent implements OnInit {
  @Input() knowledgeBaseData: any=[];
  
  constructor(
    public settingService : SettingsService
  ) { }

  ngOnInit(): void {
  }

}
