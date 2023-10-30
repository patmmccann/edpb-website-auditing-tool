import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  localStorage:any=null;
  option:'general'|'browser'|'analysis'|'cookies'='general';

  SSLLocation: FormGroup = new FormGroup({
    ssl_location: new FormControl('', [])
  });

  constructor(
    private el: ElementRef,
    public settingService : SettingsService
  ) { 
    this.localStorage =localStorage;

  }

  ngOnInit(): void {

  }
}
