import { Component } from '@angular/core';
import { LanguagesService } from './services/languages.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  constructor(
    private languagesService: LanguagesService) {
      // Languages initialization
      this.languagesService.initLanguages();
      this.languagesService.getOrSetCurrentLanguage();
    }
}
