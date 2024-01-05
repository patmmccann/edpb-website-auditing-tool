/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { Component,Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  name: string,
  author: string,
  category : string
}

@Component({
  selector: 'app-new-base',
  templateUrl: './new-base.component.html',
  styleUrls: ['./new-base.component.scss']
})
export class NewBaseComponent {

  constructor(
    public dialogRef: MatDialogRef<NewBaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
