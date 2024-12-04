/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit,EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    standalone: false
})
export class ModalComponent implements OnInit {
  @Input() specialClass: string ="";
  @Output() clickOnClose = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
