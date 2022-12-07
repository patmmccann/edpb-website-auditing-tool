import { EventEmitter, Injectable, Output  } from '@angular/core';
import { ApplicationDb } from '../application.db';
import { Card } from '../models/card.model';
import { BeaconCard } from '../models/cards/beacon-card.model';
import { CookieCard } from '../models/cards/cookie-card.model';
import { HTTPCard } from '../models/cards/http-card.model';
import { LocalStorageCard } from '../models/cards/local-storage-card.model';
import { TestSSLCard } from '../models/cards/test-sslcard.model';
import { TrafficCard } from '../models/cards/traffic-card.model';
import { UnsafeFormsCard } from '../models/cards/unsafe-forms-card.model';
import { Evaluation } from '../models/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { SettingsService } from './settings.service';

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

      const promises = cards.map(card => super.create(card));

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
      super.create(card)
      .then(card => {
        resolve(card);
      })
    });
  }


  deleteCard(card: Card): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clearEvaluation(card);
      this.delete(card.id);
      resolve();
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
    if (this.settingService.cookies) {
      cards.push(new CookieCard("Cookies"));
    }

    if (this.settingService.localstorage) {
      cards.push(new LocalStorageCard("Local Storage"));
    }

    if (this.settingService.https) {
      cards.push(new HTTPCard(null));
    }

    if (this.settingService.traffic) {
      cards.push(new TrafficCard(null));
    }

    if (this.settingService.webform) {
      cards.push(new UnsafeFormsCard([]));
    }

    if (this.settingService.beacons) {
      cards.push(new BeaconCard());
    }

    if (this.settingService.testssl) {
      cards.push(new TestSSLCard({}, null, null));
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
}
