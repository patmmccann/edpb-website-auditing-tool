/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LanguagesService } from 'src/app/services/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  help_content: 'home'| 'how_the_tool_works' | 'new_analysis' | 'knowledge_base' | 'create_reports' = 'home';
  showLanguage =false;

  constructor(
    private route: ActivatedRoute,
    public translateService: TranslateService,
    public languagesService: LanguagesService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const section = params['section_id'];

      switch(section){
        case 'how_the_tool_works':
          this.help_content = 'how_the_tool_works';
          break;
        case 'new_analysis':
            this.help_content = 'new_analysis';
            break;
        case 'knowledge_base':
          this.help_content = 'knowledge_base';
          break;
        case 'create_reports':
          this.help_content = 'create_reports';
          break;
      }
      window.scroll(0, 0);
    });
    
  }

}
