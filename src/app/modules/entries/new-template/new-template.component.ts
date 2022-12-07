import { Component, Inject,ElementRef } from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatFormFieldControl } from '@angular/material/form-field';
export interface TemplateData {
  name: string,
  author: string,
  pug : string
}

@Component({
  selector: 'app-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss']
})
export class NewTemplateComponent {

  importForm: FormGroup = new FormGroup({
    import_template: new FormControl('', [])
  });

  constructor(
    private el: ElementRef,
    public dialogRef: MatDialogRef<NewTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TemplateData,
  ) { }


  onNoClick(): void {
    this.dialogRef.close();
  }

    /**
   * Import a new template.
   */
  import(event?: any): void {
    if (event) {
      const reader = new FileReader();
      reader.readAsText(event.target.files[0], 'UTF-8');
      reader.onload = (event2: any) => {
        this.data.pug = event2.target.result;
      };
    } else {
      this.el.nativeElement.querySelector('#import_template').click();
    }
  }


}
