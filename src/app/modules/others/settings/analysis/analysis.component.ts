import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent {
  localStorage:any=null;
  
  SSLLocation: FormGroup = new FormGroup({
    ssl_location: new FormControl('', [])
  });

  constructor(
    private el: ElementRef,
    public settingService : SettingsService
  ) { 
    this.localStorage =localStorage;

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
