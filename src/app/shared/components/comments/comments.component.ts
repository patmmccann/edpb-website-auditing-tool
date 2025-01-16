/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit } from '@angular/core';
import { CommentItemComponent } from './comment-item/comment-item.component';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.scss'],
    imports: [CommentItemComponent]
})
export class CommentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
