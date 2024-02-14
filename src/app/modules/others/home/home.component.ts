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
  help_content: 'home'| 'how_the_tool_works' | 'new_analysis' | 'knowledge_base' | 'create_reports' | 'about_tool' = 'home';
  showLanguage =false;
  content = "";

  constructor(
    private route: ActivatedRoute,
    public translateService: TranslateService,
    public languagesService: LanguagesService,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    const language = this.translateService.currentLang;
    let fileTranslation = /*language  === 'fr' ? 'fr' :*/ 'en';
    let file :null |string = null;

    this.route.params.subscribe((params: Params) => {
      const section = params['section_id'];

      switch(section){
        case 'about_tool':
          this.help_content = 'about_tool';
          break;
        case 'home':
            this.help_content = 'home';
            break;
        case 'how_the_tool_works':
          this.help_content = 'how_the_tool_works';
          file = `./assets/files/how_tools_works_${fileTranslation}.html`
          break;
        case 'new_analysis':
            this.help_content = 'new_analysis';
            file = `./assets/files/new_analysis_${fileTranslation}.html`
            break;
        case 'knowledge_base':
          this.help_content = 'knowledge_base';
          file = `./assets/files/knowledge_base_${fileTranslation}.html`
          break;
        case 'create_reports':
          this.help_content = 'create_reports';
          file = `./assets/files/create_reports_${fileTranslation}.html`
          break;
      }

      if (file != null){
        this.httpClient.get(file, { responseType: 'text' }).subscribe(res => {
          this.content = res;
        });
      }

      window.scroll(0, 0);
    });
    
  }

}
