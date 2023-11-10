import { Component, Input } from '@angular/core';
import { BrowserService } from 'src/app/services/browser.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-docx',
  templateUrl: './docx.component.html',
  styleUrls: ['./docx.component.scss']
})
export class DocxComponent {
  @Input() editing: boolean = false;
  @Input() pug: string = "";


  orientation : 'portrait' | 'landscape' = 'portrait';
  creator: string = "";
  title: string = "";
  pageNumber : 'yes' | 'no' = 'yes';
  _pageSize : 'A1'| 'A2' | 'A3' | 'A4' = 'A4';

  constructor(
    private languagesService: LanguagesService,
    private reportService : ReportService
  ){

  }



  get pageSize(){
    switch(this._pageSize){
      case "A1":
        return {width: "59.4cm", height: "84.1cm"}
      case "A2":
        return {width: "42.0cm", height: "59.4cm"}
      case "A3":
        return {width: "29.7cm", height: "42.0cm"}
      case "A4":
        return {width: "21.0cm", height: "29.7cm"}
    }
  }

  async save(){
    function export_result(url: any, name: string) {
      const a = document.getElementById('exportDocx');

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
    const docx = await this.reportService.print_to_docx(this.pug, "", {
      orientation:this.orientation,
      pageSize:this.pageSize,
      pageNumber:this.pageNumber == "yes",
      title:this.title,
      lang:this.languagesService.browserCultureLang(),
      creator: this.creator
    }, "");
    const blobUrl = URL.createObjectURL(new Blob([docx]));
    export_result(blobUrl, date + '_export.docx');
  }
}
