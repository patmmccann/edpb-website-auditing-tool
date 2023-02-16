import { Component, Input, OnInit } from '@angular/core';
import { LocalStorageKnowledge } from 'src/app/models/knowledges/localstorage-knowledge.model';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-knowledge-localstorage-item',
  templateUrl: './knowledge-localstorage-item.component.html',
  styleUrls: ['./knowledge-localstorage-item.component.scss']
})
export class KnowledgeLocalstorageItemComponent implements OnInit {
  @Input() knowledgeBaseData: any=[];
  
  constructor(
    public settingService : SettingsService
  ) { }

  ngOnInit(): void {
  }

}
