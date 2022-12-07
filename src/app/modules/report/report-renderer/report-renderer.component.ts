import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-report-renderer',
  templateUrl: './report-renderer.component.html',
  styleUrls: ['./report-renderer.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ReportRendererComponent implements OnInit {

  @Input() html:string ="";
  constructor() { }
  


  ngOnInit(): void {
  }

  initmce(): void {

  }
}
