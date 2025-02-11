/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit } from '@angular/core';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatList, MatListSubheaderCssMatStyler, MatListItem } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatFormField, MatLabel, MatInput, FormsModule, MatIconModule, MatSuffix, MatList, MatDivider, MatListSubheaderCssMatStyler, MatListItem, MatCheckbox, TranslateModule]
})
export class FiltersComponent implements OnInit {
  searchTerm : String ="";
  constructor() { }

  ngOnInit(): void {
  }

  onCleanSearch(): void {
    this.searchTerm = '';
  }

}
