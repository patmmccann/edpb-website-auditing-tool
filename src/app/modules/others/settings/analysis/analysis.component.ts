/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserService } from 'src/app/services/browser.service';
import { SettingsService } from 'src/app/services/settings.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss'],
    imports: [MatSlideToggle, FormsModule, MatFormField, MatSelect, MatOption, MatLabel, MatInput, MatIconModule, ReactiveFormsModule, MatButtonModule, ModalComponent, TranslateModule]
})
export class AnalysisComponent {
  localStorage:any=null;
  
  SSLLocation: FormGroup = new FormGroup({
    ssl_location: new FormControl('', [])
  });

  testSSLResult = "";

  constructor(
    private el: ElementRef,
    public settingService : SettingsService,
    public browserService : BrowserService
  ) { 
    this.localStorage =localStorage;

  }

  checkSSLLocation(event:any) :void{
    if (event.target.files[0].path){
      this.settingService.setTestSSLLocation(event.target.files[0].path)
      this.browserService.updateSettings();
    }
  }

  getSSLLocation(event?: any):void{
    if (event) {
      
    } else {
      this.el.nativeElement.querySelector('#ssl_location').click();
    }
  }

  async testSSLLocation(){
    const output = await this.browserService.testSSLLocation(window);
    const lines = output.split('\n');
    const htmlOutput = lines.map((line:string) => {
      return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    });

    this.testSSLResult = htmlOutput;
  }
}
