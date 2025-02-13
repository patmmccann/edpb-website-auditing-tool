/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit } from '@angular/core';
import { BrowserService, BrowserSession } from 'src/app/services/browser.service';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { MatNavList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler, MatListItemTitle } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss'],
    imports: [MatDrawerContainer, MatDrawer, MatNavList, MatListItem, MatIconModule, MatListItemIcon, MatListSubheaderCssMatStyler, MatDivider, RouterLink, MatListItemTitle,MatDrawerContent, RouterOutlet, TranslateModule]
})
export class SideNavComponent implements OnInit {
  pinned: boolean = true;
  sessions: BrowserSession[] = [];

  constructor(
    public browserService: BrowserService
  ) { }

  ngOnInit(): void {
    this.browserService.sessionEvent.subscribe((session: BrowserSession) => {
      switch(session.event){
        case 'new':
          this.sessions.push(session);
          break;
        case 'delete':
          const idx = this.sessions.findIndex(s =>  s.analysis.id == session.analysis.id && s.tag.id == session.tag.id);
          if (idx != -1) this.sessions.splice(idx, 1);
          break;
      }
    });
  }

  changePinned(): void {
    this.pinned = !this.pinned;
    setTimeout(async () => {
      window.dispatchEvent(new Event('resize'));
    }, 210);
  }
}
