import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.scss']
})
export class SourcesComponent implements OnInit {
  @Output() clickOnClose = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
