import { Component } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent {
  localStorage:any=null;

  constructor(
    public settingService : SettingsService
  ) { 
    this.localStorage =localStorage;
  }
}
