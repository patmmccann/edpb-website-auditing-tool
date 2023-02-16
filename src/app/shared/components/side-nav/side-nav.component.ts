import { Component, OnInit } from '@angular/core';
import { BrowserService, BrowserSession } from 'src/app/services/browser.service';


@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  pinned: boolean = true;
  sessions: BrowserSession[] = [];

  constructor(
    private browserService: BrowserService
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
    }, 10);
  }
}
