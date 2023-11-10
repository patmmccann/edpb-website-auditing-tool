import { Component, Input } from '@angular/core';

export type saveOptions = 'docx' | 'none';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() editing: boolean = false;
  @Input() pug: string = "";
  @Input() saveOption: saveOptions  = 'none';
}
