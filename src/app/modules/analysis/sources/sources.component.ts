/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-sources',
    templateUrl: './sources.component.html',
    styleUrls: ['./sources.component.scss'],
    standalone: false
})
export class SourcesComponent implements OnInit {
  @Output() clickOnClose = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
