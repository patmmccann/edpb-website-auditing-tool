/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { EventEmitter, Injectable, Output  } from '@angular/core';
import { ApplicationDb } from '../classes/application.db';
import { Card } from '../models/card.model';
import { BeaconCard } from '../models/cards/beacon-card.model';
import { CookieCard } from '../models/cards/cookie-card.model';
import { HTTPCard } from '../models/cards/http-card.model';
import { LocalStorageCard } from '../models/cards/local-storage-card.model';
import { TestSSLCard } from '../models/cards/test-sslcard.model';
import { TrafficCard } from '../models/cards/traffic-card.model';
import { UnsafeFormsCard } from '../models/cards/unsafe-forms-card.model';
import { ScreenshotCard } from '../models/cards/screenshot-card.model';
import { Evaluation } from '../models/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { SettingsService } from './settings.service';
import { InfoCard } from '../models/cards/info-card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService extends ApplicationDb {

  @Output() evaluationEvent = new EventEmitter<number>();

  constructor(
    private evaluationService: EvaluationService,
    private settingService :SettingsService
  ) {
    super(1, 'card');
  }

  /**
   * Save a set of cards
   */
  saveCards(cards: Card[]): Promise<any> {
    return new Promise((resolve, reject) => {

      const promises = cards.map(card => super.create(card.toJson()));

      Promise.all(promises).then(cards => {
        resolve(cards.flat());
      })
    });
  }

  /**
   * Save a set of cards
   */
  saveCard(card: Card): Promise<any> {
    return new Promise((resolve, reject) => {
      super.create(card.toJson())
      .then(card => {
        resolve(card);
      })
    });
  }

  getAllCards(cards_id: number[]): Promise<Card[]> {
    return new Promise((resolve, reject) => {

      const promises = cards_id.map(id => super.find(id));

      Promise.all(promises).then(cards => {
        resolve(cards.flat());
      })
    });
  }

  updateAll(cards: Card[], date?: Date | null): Promise<any> {
    return new Promise((resolve, reject) => {

      const promises = cards.map(card => this.update(card));

      Promise.all(promises).then(cards => {
        resolve(cards.flat());
      })
    });
  }

  override update(card: Card, date?: Date | null): Promise<any> {
    return new Promise((resolve, reject) => {
      super.find(card.id).then((entry: any) => {
        entry = {
          ...entry,
          ...card
        };

        entry.updated_at = date ? date : new Date();
        super
          .update(entry.id, entry)
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      });
    });
  }

  setEvaluation(card: Card, evaluation: Evaluation): Promise<Evaluation> {
    return new Promise(async (resolve, reject) => {
      if (card.evaluation) {
        evaluation.id = card.evaluation;
        this
          .evaluationService
          .update(evaluation)
          .then((result: Evaluation) => {
            this.evaluationEvent.emit(card.id);
            resolve(result);
          });
      } else {
        this
          .evaluationService
          .create(evaluation)
          .then((result: Evaluation) => {
            card.evaluation = result.id;
            this
              .update(card)
              .then((res: Card) => {
                this.evaluationEvent.emit(card.id);
                resolve(result);
              });
          });
      }
    });
  }

  getEvaluation(card: Card): Promise<Evaluation | null> {
    return new Promise(async (resolve, reject) => {
      if (card.evaluation) {
        this
          .evaluationService
          .find(card.evaluation)
          .then((result: Evaluation) => {
            resolve(result);
          });
      } else {
        resolve(null);
      }
    });
  }

  override async delete(id: number) {
    const card = await this.find(id);
    if (card.evaluation){
      await this.evaluationService.delete(card.evaluation);
    }
    super.delete(card.id);
  }

  clearEvaluation(card: Card): Promise<Card> {
    return new Promise(async (resolve, reject) => {
      if (card.evaluation) {
        this
          .evaluationService
          .delete(card.evaluation)
          .then(() => {
            card.evaluation = null;
            this.update(card).then(() => {
              resolve(card);
            });
          });
      } else {
        resolve(card);
      }
    });
  }

  initCardsBasedOnSetting() : Card[]{
    const cards :Card[]= [];
    if (this.settingService.settings.cookies) {
      cards.push(new CookieCard("Cookie logs"));
    }

    if (this.settingService.settings.cookies_cache) {
      cards.push(new CookieCard("Cookies in cache", true));
    }
    
    if (this.settingService.settings.cookies_requests) {
      cards.push(new CookieCard("Cookies in requests", false, true));
    }

    if (this.settingService.settings.localstorage) {
      cards.push(new LocalStorageCard("Local Storage"));
    }

    if (this.settingService.settings.https) {
      cards.push(new HTTPCard(null));
    }

    if (this.settingService.settings.traffic) {
      cards.push(new TrafficCard(null));
    }

    if (this.settingService.settings.webform) {
      cards.push(new UnsafeFormsCard([]));
    }

    if (this.settingService.settings.beacons) {
      cards.push(new BeaconCard());
    }

    if (this.settingService.settings.testssl) {
      cards.push(new TestSSLCard({}, null, null));
    }

    if (this.settingService.settings.infos) {
      cards.push(new InfoCard(null));
    }

    return cards;
  }

  castToCookieCard(card:Card):CookieCard{
    return (card as CookieCard);
  }

  castToLocalStorageCard(card:Card):LocalStorageCard{
    return (card as LocalStorageCard);
  }

  castToHTTPCard(card:Card):HTTPCard{
    return (card as HTTPCard);
  }
  
  castToSSLCard(card:Card):TestSSLCard{
    return (card as TestSSLCard);
  }

  castToTrafficCard(card:Card):TrafficCard{
    return (card as TrafficCard);
  }

  castToUnsafeFormsCard(card:Card):UnsafeFormsCard{
    return (card as UnsafeFormsCard);
  }

  castToBeaconCard(card:Card):BeaconCard{
    return (card as BeaconCard);
  }

  castToInfoCard(card:Card):InfoCard{
    return (card as InfoCard);
  }

  async export(id: number): Promise<any> {
    const card = await this.find(id);
    const data: any = { ...card };
    delete data.id;
    
    if (card.evaluation) {
      const evaluation = await this.evaluationService.export(card.evaluation);
      data.evaluation = evaluation;
    }

    switch(card.kind){
      case "image":
        data.image = await ScreenshotCard.blobToBase64(data.image);

    }

    return data;
  }

  override async find(id: number | string): Promise<Card> {
    return super.find(id);
  }

  async parse(data: any){
    if (data.evaluation) {
      const evaluation = await this.evaluationService.create(data.evaluation);
      data.evaluation = evaluation.id;
    }

    switch(data.kind){
      case "image":
        data.image = await ScreenshotCard.base64toBlob(data.image);

    }

    return await this.create(data);
  }
}
