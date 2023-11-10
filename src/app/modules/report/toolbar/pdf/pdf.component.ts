import { Component, Input } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
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
