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
  option:'browser'|'analysis'|'cookies'='browser';

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

  checkSSLLocation(event:any) :void{
    if (event.target.files[0].path){
      this.settingService.setTestSSLLocation(event.target.files[0].path)
    }
  }

  getSSLLocation(event?: any):void{
    if (event) {
      
    } else {
      this.el.nativeElement.querySelector('#ssl_location').click();
    }
  }
}
