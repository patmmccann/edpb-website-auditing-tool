import { Component, ElementRef, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { CookieSearch } from 'src/app/services/knowledges/cookie-knowledges.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-knowledge-cookie-item',
  templateUrl: './knowledge-cookie-item.component.html',
  styleUrls: ['./knowledge-cookie-item.component.scss']
})
export class KnowledgeCookieItemComponent implements OnInit, OnChanges {

  @Input() knowledgeBaseData: any = {
    name_and_domain: [],
    name: [],
    domain: []
  };

  public knowledgeBases: { [key: number]: KnowledgeBase } = {};

  constructor(
    public settingService : SettingsService
  ) { }

  ngOnChanges(changes: SimpleChanges) {

  }
  
  ngOnInit(): void {
    
  }

}
