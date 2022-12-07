import { Component, EventEmitter,OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-new-knowledgebase',
  templateUrl: './new-knowledgebase.component.html',
  styleUrls: ['./new-knowledgebase.component.scss']
})
export class NewKnowledgebaseComponent implements OnInit {
  @Output() submitted = new EventEmitter();
  knowledgeBaseForm: FormGroup = new FormGroup({});

  constructor() { }

  ngOnInit(): void {
    this.knowledgeBaseForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl()
    });
  }

}
