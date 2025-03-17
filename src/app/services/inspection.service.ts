/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { TrafficCard } from '../models/cards/traffic-card.model';
import { CookieLine } from '../models/cards/cookie-card.model';
import { LocalStorageLine } from '../models/cards/local-storage-card.model';
import { CookieCard } from '../models/cards/cookie-card.model';
import { LocalStorageCard } from '../models/cards/local-storage-card.model';
import { ScreenshotCard } from '../models/cards/screenshot-card.model';
import { SourceCard } from '../models/cards/source-card.model';
import { HTTPCard } from '../models/cards/http-card.model';
import { TestSSLCard } from '../models/cards/test-sslcard.model';
import { BeaconCard } from '../models/cards/beacon-card.model';
import { BeaconLine } from '../models/cards/beacon-card.model';
import { UnsafeFormsCard } from '../models/cards/unsafe-forms-card.model';
import { InfoCard } from '../models/cards/info-card.model';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {

  constructor() { }

  inspectHTTP(value: any):HTTPCard{
    return new HTTPCard(value);
  }

  inspectTestSSL(value: any, testSSLError:string | null, testSSLErrorOutput:string | null):TestSSLCard{
    return new TestSSLCard(value, testSSLError, testSSLErrorOutput);
  }

  inspectTraffic(value: any):TrafficCard{
    return new TrafficCard(
      value
    );
  }


  inspectCookie(value: any):CookieCard{

    const cookieCard = new CookieCard("Cookies");
    if (!value) return cookieCard;
    value.forEach((cookie:any, idx:number) => {
      const cookieLine = new CookieLine(cookie, idx);
      cookieCard.push(cookieLine)
    });

    return cookieCard;
  }

  inspectLocalStorage(value: any):LocalStorageCard{
    const localStorageCard = new LocalStorageCard("Local Storage");
    if (!value) return localStorageCard;
    let idx = 0;
    for (const host in value) {
      for (const key in value[host]) {
        const localStorageLine = new LocalStorageLine(host, key, value[host][key], idx++);
        localStorageCard.push(localStorageLine)
      }
    }

    return localStorageCard;
  }

  inspectUnsafeForms(value:any) : UnsafeFormsCard{
    return new UnsafeFormsCard(value);
  }

  inspectInfo(value:any) : InfoCard{
    return new InfoCard(value);
  }

  inspectBeacons(value:any) : BeaconCard{
    const beaconCard = new BeaconCard();
    if (!value) return beaconCard;
    
    value.forEach((beacon:any, idx:number) => {
      const beaconLine = new BeaconLine(beacon, idx);
      beaconCard.push(beaconLine)
    });

    return beaconCard;
  }

  inspectionParser(json: { [key: string]: any }): Card[] {
    const cards: Card[] = [];
    const info= new InfoCard(null);
    cards.push(info);

    for (const key in json) {
      const value = json[key];
      if (!value) continue;
      switch (key) {
        case "script":
          info.tool_version = value.version.npm;
          break;
        case "browser":
          info.user_agent = value.user_agent;
          info.chrome_version = value.version;
          break;
        case "browsing_history":
          info.visited_urls = value;
          break;
        case "host":
          info.url = value;
          break;
        case "start_time":
          info.start_time = value;
          break;
        case "end_time":
          info.end_time = value;
          break;
        case "hosts":
          const hosts = this.inspectTraffic(value);
          cards.push(hosts)
          break;
        case "cookies":
          const cookieCard = this.inspectCookie(value);
          cards.push(cookieCard);
          break;
        case "beacons":
            const beaconCard = this.inspectBeacons(value);
            cards.push(beaconCard);
            break;
        case "localStorage":
          const localStorageCard = this.inspectLocalStorage(value);
          cards.push(localStorageCard);
          break;
        case "secure_connection":
          const httpCard = this.inspectHTTP(value);
          cards.push(httpCard);
          break;
        case "testSSL":
          const testsslCard = this.inspectTestSSL(value, null, null);
          cards.push(testsslCard);
          break;
        case "unsafeForms":
            const unsafeFormsCard = this.inspectUnsafeForms(value);
            cards.push(unsafeFormsCard);
            break;
      }
    }

    return cards;
  }

  inspectionReader(file: File): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (event2: any) => {
        const data = JSON.parse(event2.target.result);
        const inspectionCards = this.inspectionParser(data)
        resolve(inspectionCards);
      };
    });
  }

  screenshotReader(name: string, file: File): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (event2: any) => {
        const screenShotCard = new ScreenshotCard(name);
        screenShotCard.image = new Blob([event2.target.result], { type: "image/png" });
        resolve([screenShotCard]);
      };
    });
  }

  sourceReader(name: string, file: File): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (event2: any) => {
        const sourceCard = new SourceCard(name);
        sourceCard.source = event2.target.result;
        resolve([sourceCard]);
      };
    });
  }

  importHarFile(file: File): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (event2: any) => {
        const har = JSON.parse(event2.target.result);
      };
    });

  }

  importWecFiles(files: File[]): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      const promiseCards: Promise<Card[]>[] = [];
      for (const file of files) {
        switch (file.name) {
          case "inspection.json":
            promiseCards.push(this.inspectionReader(file));
            break;

          case "screenshot-top.png":
            promiseCards.push(this.screenshotReader("Top screenshot", file));
            break;

          case "screenshot-full.png":
            promiseCards.push(this.screenshotReader("Full screenshot", file));
            break;

          case "screenshot-bottom.png":
            promiseCards.push(this.screenshotReader("Bottom Screenshot", file));
            break;

          case "source.html":
            promiseCards.push(this.sourceReader("Website source", file));
            break;
        }
      }
      Promise.all(promiseCards).then((allcards) => {
        resolve(allcards.flat());
      });
    });
  }

  importUrls(file: File): Promise<string[]>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (event2: any) => {
        resolve(event2.target.result.split('\n'));
      };
    });
  }
}
