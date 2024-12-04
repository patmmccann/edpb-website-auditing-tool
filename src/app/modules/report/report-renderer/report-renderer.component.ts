/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-report-renderer',
    templateUrl: './report-renderer.component.html',
    styleUrls: ['./report-renderer.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class ReportRendererComponent implements OnInit {

  @Input() html:string ="";
  constructor() { }
  


  ngOnInit(): void {
  }

  initmce(): void {

  }
}
