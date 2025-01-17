/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnalysisService } from 'src/app/services/analysis.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-toolbar-analysis',
    templateUrl: './toolbar-analysis.component.html',
    styleUrls: ['./toolbar-analysis.component.scss'],
    imports: [MatToolbar, MatButtonModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class ToolbarAnalysisComponent {
  @Output() imported = new EventEmitter<number>();
  
  importAnalysis: FormGroup = new FormGroup({
    import_analysis: new FormControl('', [])
  });

  constructor(
    private el: ElementRef,
    private analysisService: AnalysisService
  ){

  }

  /**
   * Import a new analysis.
   */
  import(event?: any): void {
    if (event) {
      this.analysisService
      .import(event.target.files[0])
      .then((analysis) => {
        if (analysis)
          this.imported.emit(analysis.id);
      })
      .catch((err:Error) => {
        console.log(err);
      });
    } else {
      this.el.nativeElement.querySelector('#import_analysis').click();
    }
  }
}
