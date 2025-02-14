/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component } from '@angular/core';
import { LanguagesService } from 'src/app/services/languages.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-languages',
    templateUrl: './languages.component.html',
    styleUrls: ['./languages.component.scss'],
    imports: [TranslateModule]
})
export class LanguagesComponent {
  constructor(
    public languagesService: LanguagesService
  ) { }
}
