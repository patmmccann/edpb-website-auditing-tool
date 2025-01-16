/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';
import { LanguagesComponent } from '../../../../shared/components/languages/languages.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrls: ['./general.component.scss'],
    imports: [LanguagesComponent, TranslateModule]
})
export class GeneralComponent {
  remoteForm: UntypedFormGroup;
  localStorage:any=null;
  
  constructor(
    public settingService : SettingsService,
    private fb: UntypedFormBuilder,
  ) { 
    this.localStorage =localStorage;
    this.remoteForm = this.fb.group({
      id: 1,
      server_url: ['', Validators.required],
      client_id: ['', Validators.required],
      client_secret: ['', Validators.required]
    });

    this.remoteForm.patchValue({
      server_url: settingService.settings.server_url,
      client_id:  settingService.settings.client_id,
      client_secret: settingService.settings.client_secret
    });
  }

  onSubmit(): void {

  }

  purify(field : string, $event : any) {
    this.remoteForm.controls[field].patchValue(
      $event.target.value.replace(/\s/g, ''),
      { emitEvent: false }
    );
  }
}
