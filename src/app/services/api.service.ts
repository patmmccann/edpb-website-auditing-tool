import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public base: string;
  public defaultConfig: any = {
    headers: new Headers(),
    mode: 'cors'
  };

  constructor(
    settingsService : SettingsService
  ) { 
    this.base = settingsService.settings.server_url;

  }
}
