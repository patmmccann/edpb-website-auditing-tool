/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-item',
  templateUrl: './knowledge-base-item.component.html',
  styleUrls: ['./knowledge-base-item.component.scss']
})
export class KnowledgeBaseItemComponent implements OnInit {

  @Input() item: any;
  @Input() itemKb: any = {name:"", description:"", slug:""};
  titleKb: string="";

  constructor(
    private el: ElementRef,
    public knowledgeBaseService: KnowledgeBaseService,
  ) { }

  ngOnInit(): void {
  }

  /**
   * Shows or hides an help item.
   */
   displayItem() {
    const accordion = this.el.nativeElement.querySelector(
      '.base-knowledgeBaseBlock-item-accordion button span'
    );
    const displayer = this.el.nativeElement.querySelector(
      '.base-knowledgeBaseBlock-item-content'
    );
    if (displayer.classList.contains('hide')) {
      displayer.classList.remove('hide');
      accordion.classList.remove('base-icon-accordion-down');
      accordion.classList.add('base-icon-accordion-up');
    } else {
      displayer.classList.add('hide');
      accordion.classList.remove('base-icon-accordion-up');
      accordion.classList.add('base-icon-accordion-down');
    }
  }

}
