/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-pdf',
    templateUrl: './pdf.component.html',
    styleUrls: ['./pdf.component.scss'],
    imports: [MatFormField, MatLabel, MatSelect, MatOption, MatIconModule, MatInput, FormsModule, MatButtonModule]
})
export class PdfComponent {
  @Input() editing: boolean = false;
  @Input() pug: string = "";
  
  landscape : 'portrait' | 'landscape' = 'portrait';
  pageSize : 'A1'| 'A2' | 'A3' | 'A4' = 'A4';
  scale : number = 1;

  constructor(
    private reportService : ReportService
  ){

  }

  async save(){
    function export_result(url: any, name: string) {
      const a = document.getElementById('exportPDF');

      if (a) {
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          name
        );
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      }
    }
    
    const date = new Date().getTime();
    const docx = await this.reportService.print_to_pdf(this.pug, "", {
      landscape: this.landscape == 'landscape',
      pageSize : this.pageSize,
      scale : this.scale
    }, "");
    const blobUrl = URL.createObjectURL(new Blob([docx]));
    export_result(blobUrl, date + '_export.pdf');
  }
}
