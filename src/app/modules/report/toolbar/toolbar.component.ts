/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input } from '@angular/core';

export type saveOptions = 'docx' | 'pdf' |'none';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    standalone: false
})
export class ToolbarComponent {
  @Input() editing: boolean = false;
  @Input() pug: string = "";
  @Input() saveOption: saveOptions  = 'none';
}
