import { Injectable, EventEmitter, Output, ElementRef } from '@angular/core';
import { Analysis } from '../models/analysis.model';
import { Card } from '../models/card.model';
import { Tag } from '../models/tag.model';
import { BrowseComponent } from '../modules/browse/browse.component';
import { InspectionService } from 'src/app/services/inspection.service';
import { CookieCard } from '../models/cards/cookie-card.model';
import { LocalStorageCard } from '../models/cards/local-storage-card.model';
import { ScreenshotCard } from '../models/cards/screenshot-card.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HTTPCard } from '../models/cards/http-card.model';
import { TestSSLCard } from '../models/cards/test-sslcard.model';
import { TrafficCard } from '../models/cards/traffic-card.model';
import { UnsafeFormsCard } from '../models/cards/unsafe-forms-card.model';
import { BeaconCard } from '../models/cards/beacon-card.model';
import { SettingsService } from './settings.service';


export interface BrowserSession {
  event: 'new' | 'delete',
  analysis: Analysis,
  tag: Tag,
  link?: any[]
}


@Injectable({
  providedIn: 'root'
})

export class BrowserService {
  @Output() sessionEvent = new EventEmitter<BrowserSession>();
  @Output() loadEvent = new EventEmitter<any>();
  cards: Card[] = [];

  constructor(
    private inspectionService: InspectionService,
    private settingService: SettingsService
  ) {
    if (!(window as any).electron) this.createFakeElectron(window);

    (window as any).electron.subscriveToBrowserEvent((args: any) => {
      this.loadEvent.emit(args);
    })

    this.newSession(window, null, null);
  }

  createFakeElectron(window: any): void {
    window.electron = {
      createCollector: (analysis_id: number, tag_id: number, url: string, args: any): Promise<void> => new Promise((resolve, reject) => resolve()),
      eraseSession: (analysis_id: number, tag_id: number, url: string, args: any): Promise<void> => new Promise((resolve, reject) => resolve()),
      deleteCollector: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      showSession: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      getSessions: (): Promise<void> => new Promise((resolve, reject) => resolve()),
      hideSession: (): Promise<void> => new Promise((resolve, reject) => resolve()),
      resizeSession: (rect: any): Promise<void> => new Promise((resolve, reject) => resolve()),
      save: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      loadURL: (analysis_id: number, tag_id: number, url: string): Promise<void> => new Promise((resolve, reject) => resolve()),
      getURL: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      get: (analysis_id: number, tag_id: number, url: string, waitForComplete: boolean): Promise<any> => new Promise((resolve, reject) => resolve([])),
      screenshot: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      stop: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      refresh: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      backward: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      forward: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      canGoBackward: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      canGoForward: (analysis_id: number, tag_id: number): Promise<void> => new Promise((resolve, reject) => resolve()),
      subscriveToBrowserEvent: (callback: any): Promise<void> => new Promise((resolve, reject) => resolve()),
      renderPug: (template: string, data: any): Promise<void> => new Promise((resolve, reject) => resolve()),
      parseHar: (har: any, args: any): Promise<void> => new Promise((resolve, reject) => resolve()),
      print_to_docx: (htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string): Promise<void> => new Promise((resolve, reject) => resolve()),
    }
  }

  newSession(window: any, analysis: Analysis | null, tag: Tag | null): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let args = this.settingService.toArgs();

      if (analysis && tag) {
        window.electron.createCollector(analysis.id, tag.id, analysis.url, args).then(() => {
          const link = ['/browse', analysis.id, 'tag', tag.id];
          this.sessionEvent.emit({ event: 'new', analysis: analysis, tag: tag, link: link });
          return resolve(link);
        });
      } else {
        window.electron.createCollector(null, null, null, args);
      }

    });
  }

  showSession(window: any, component: BrowseComponent, analysis: Analysis | null, tag: Tag | null): Promise<string> {
    return new Promise((resolve, reject) => {
      window.onresize = (event: Event) => {
        setTimeout(() => {
          const rect_resize = (component.contentElement as any).nativeElement.getBoundingClientRect();
          window.electron.resizeSession({ 'x': Math.round(rect_resize.left), 'y': Math.round(rect_resize.top + 30), 'width': Math.round(rect_resize.width), 'height': Math.round(rect_resize.height) });
        }, 100);
      }

      window.electron.showSession(analysis ? analysis.id : null, tag ? tag.id : null).then((url: string) => {
        window.dispatchEvent(new Event('resize'));
        resolve(url);
      })
    });
  }

  eraseSession(window: any, analysis: Analysis | null, tag: Tag | null) {
    let args = this.settingService.toArgs();
    return window.electron.eraseSession(analysis ? analysis.id : null, tag ? tag.id : null, args);
  }

  toogleDevTool(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.toogleDevTool(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  getURL(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.getURL(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  canGoBackward(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.canGoBackward(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  canGoForward(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.canGoForward(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  deleteSession(window: any, analysis: Analysis, tag: Tag): Promise<any[]> {
    return new Promise((resolve, reject) => {
      window.electron.deleteCollector(analysis.id, tag.id, analysis.url, {}).then(() => {
        this.sessionEvent.emit({ event: 'delete', analysis: analysis, tag: tag });

        return resolve([]);
      });
    });
  }

  hideSession(window: any) {
    window.onresize = null;
    return window.electron.hideSession();
  }

  gotoURL(window: any, analysis: Analysis | null, tag: Tag | null, url: string) {
    return window.electron.loadURL(analysis ? analysis.id : null, tag ? tag.id : null, url);
  }

  stop(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.stop(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  backward(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.backward(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  forward(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.forward(analysis ? analysis.id : null, tag ? tag.id : null);
  }


  refresh(window: any, analysis: Analysis | null, tag: Tag | null) {
    return window.electron.refresh(analysis ? analysis.id : null, tag ? tag.id : null);
  }

  getCards(window: any, analysis: Analysis | null, tag: Tag | null): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      if (analysis && tag) {
        window.electron.save(analysis ? analysis.id : null, tag ? tag.id : null)
          .then((result: any) => {
            const cards: Card[] = this.inspectionService.inspectionParser(result);
            resolve(cards);
          })
      }
    });
  }

  updateCards(window: any, cards: Card[], analysis: Analysis | null, tag: Tag | null, waitForComplete?: boolean): Promise<void> {

    return new Promise((resolve, reject) => {
      const kindCards = cards
        .map(card => card.kind)
        .filter(kind => kind != 'testSSL');

      window.electron.get(analysis ? analysis.id : null, tag ? tag.id : null, kindCards, waitForComplete, null)
        .then((output: any) => {
          for (let card of cards) {
            let new_card = null;
            switch (card.kind) {
              case 'cookie':
                {
                  let cookieCard = (card as CookieCard);
                  let new_card = this.inspectionService.inspectCookie(output.cookies);
                  if (cookieCard.cookieLines.length != new_card.cookieLines.length) {
                    cookieCard.cookieLines = new_card.cookieLines;
                  }
                }
                break;
              case 'localstorage':
                {
                  let localStorageCard = (card as LocalStorageCard);
                  let new_card = this.inspectionService.inspectLocalStorage(output.localStorage);
                  if (new_card.localStorageLines.length != localStorageCard.localStorageLines.length) {
                    localStorageCard.localStorageLines = new_card.localStorageLines;
                  }
                }
                break;
              case 'https':
                {
                  const httpCard = (card as HTTPCard);
                  const new_card = this.inspectionService.inspectHTTP(output.secure_connection);
                  httpCard.https_redirect = new_card.https_redirect;
                  httpCard.redirects = new_card.redirects;
                  httpCard.https_support = new_card.https_support;
                  httpCard.https_error = new_card.https_error;
                  httpCard.http_error = new_card.http_error;
                }
                break;
              case 'beacons':
                {
                  const beaconCard = (card as BeaconCard);
                  const newcard = this.inspectionService.inspectBeacons(output.beacons);
                  if (beaconCard.beaconLines.length != newcard.beaconLines.length) {
                    beaconCard.beaconLines = newcard.beaconLines;
                  }
                }
                break;
              case 'testSSL':
                {
                  const testSSLCard = (card as TestSSLCard);
                  const new_card = this.inspectionService.inspectTestSSL(output.testSSL, output.testSSLError, output.testSSLErrorOutput);
                  if (new_card.testSSLError || new_card.testSSLErrorOutput) {
                    testSSLCard.launched = false;
                    testSSLCard.testSSLError = new_card.testSSLError;
                    testSSLCard.testSSLErrorOutput = new_card.testSSLErrorOutput;
                  }
                  if (testSSLCard.protocols.length != new_card.protocols.length) {
                    testSSLCard.launched = false;
                    testSSLCard.protocols = new_card.protocols;
                  }

                  if (testSSLCard.vulnerabilities.length != new_card.vulnerabilities.length) {
                    testSSLCard.launched = false;
                    testSSLCard.vulnerabilities = new_card.vulnerabilities;
                  }
                }
                break;
              case 'traffic':
                {
                  const trafficCard = (card as TrafficCard);
                  const new_card = this.inspectionService.inspectTraffic(output.hosts);
                  if (new_card.requests['thirdParty']?.length != trafficCard.requests['thirdParty']?.length) {
                    trafficCard.requests['thirdParty'] = new_card.requests['thirdParty'];
                  }
                }
                break;
              case 'forms':
                {
                  const unsafeFormsCard = (card as UnsafeFormsCard);
                  const new_card = this.inspectionService.inspectUnsafeForms(output.unsafeForms);
                  if (new_card.unsafeForms.length != unsafeFormsCard.unsafeForms.length) {
                    unsafeFormsCard.unsafeForms = new_card.unsafeForms;
                  }
                }
                break;
            }
          }
          resolve();
        });
    });
  }

  launchTestSSL(window: any, card: TestSSLCard, analysis: Analysis | null, tag: Tag | null) {
    card.launched = true;
    card.testSSLError = "";
    card.testSSLErrorOutput = "";
    window.electron.get(analysis ? analysis.id : null, tag ? tag.id : null, ['testSSL'], false, this.settingService.toArgs() );
  }


  takeScreenshot(window: any, analysis: Analysis | null, tag: Tag | null): Promise<ScreenshotCard> {
    return new Promise((resolve, reject) => {
      window.electron.screenshot(analysis?.id, tag?.id)
        .then((result: any) => {
          const screenShotCard = new ScreenshotCard("New screenshot");
          screenShotCard.image = new Blob([result], { type: "image/png" });

          resolve(screenShotCard);
        });
    });
  }

  renderPug(window: any, template: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      window.electron
        .renderPug(template, data)
        .then((html: string) => {
          resolve(html);
        })
    });
  }

  parseHar(window: any, har: any): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      window.electron.parseHar(har, this.settingService.toArgs())
        .then((result: any) => {
          const cards: Card[] = this.inspectionService.inspectionParser(result);
          resolve(cards);
        });
    });
  }
}