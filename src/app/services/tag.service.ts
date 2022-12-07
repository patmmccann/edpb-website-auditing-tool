import { EventEmitter, Injectable} from '@angular/core';

import { ApplicationDb } from '../application.db'
import { Card } from '../models/card.model';
import { Tag } from '../models/tag.model';
import { CardService } from './card.service';
import { Evaluation,Status } from '../models/evaluation.model';
import { EvaluationService } from './evaluation.service';

@Injectable({
  providedIn: 'root'
})
export class TagService extends ApplicationDb {

  evaluationEvent = new EventEmitter<number>();
  
  constructor(
    private cardService: CardService,
    private evaluationService: EvaluationService
  ) {
    super(1, 'tag');
  }

  /**
   * Create a new tag
   */
  saveNewTag(tag: Tag, cards: Card[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cardService
        .saveCards(cards)
        .then((cards: Card[]) => {
          tag.cards = cards.map(x => x.id);
          super
            .create(tag)
            .then((result: Tag) => {
              resolve(result);
            })
            .catch((err: Error) => {
              reject(err);
            });
        })
    });
  }

  /**
   * Create a new tag
   */
  updateTag(tag: Tag, cards: Card[]): Promise<Tag> {
    return new Promise((resolve, reject) => {
      this.cardService
        .saveCards(cards)
        .then((cards: Card[]) => {
          tag.cards = cards.map(x => x.id);

          this
            .update(tag)
            .then((result: Tag) => {
              resolve(tag);
            })
            .catch((err: Error) => {
              reject(err);
            });
        })
    });
  }

  async deleteTag(tag:Tag):Promise<void>{
    return new Promise(async (resolve, reject) => {
      const cards = await this.getAllCards(tag);
      for(let card of cards){
        await this.removeCard(tag, card);
      }
      await this.clearEvaluation(tag);
      await this.delete(tag.id);
      resolve();
    });
  }

  override update(tag: Tag, date?: Date | null): Promise<any> {
    return new Promise((resolve, reject) => {
      super.find(tag.id).then((entry: any) => {
        entry = {
          ...entry,
          ...tag
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


  getAllCards(tag: Tag, 
    cards_type?:string[],
    status?: Status
    ): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      if (!tag.cards) resolve([]);
      
      const tags = tag.cards.map(idx => this.cardService.find(idx));

      Promise.all(tags).then((x) => {
        let cards = cards_type? 
            x.filter(card => cards_type.includes(card.kind)):
            x;

        if (!status){
          resolve(cards);
        }else{
          const eval_promise =cards.map(card=> this.cardService.getEvaluation(card));
          Promise.all(eval_promise)
          .then((evaluations)=>{
            const match_ev = evaluations
            .filter(ev => ev?.status == status)
            .map(x=> x?.id);
            resolve(cards.filter(card => match_ev.includes(card.evaluation)));
          });
        }
      });
    });
  }

  getAllCardsWithEvaluation(tag: Tag, 
    cards_type?:string[],
    status?: Status
    ): Promise<{card:Card, evaluation:Evaluation|null}[]> {
    return new Promise((resolve, reject) => {
      this.getAllCards(tag, cards_type, status)
      .then((cards)=>{
        const eval_promise = cards.map(card => this.cardService.getEvaluation(card));
        Promise.all(eval_promise)
        .then((evaluations)=>{
          resolve(cards.map((card, idx) =>({card:card, evaluation:evaluations[idx]})));
        });
      })
    });
  }

  addCard(tag: Tag, card: Card): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.cardService
        .saveCard(card)
        .then((card: Card) => {
          tag.cards.push(card.id);

          this
            .update(tag)
            .then((result: Tag) => {
              resolve(card);
            })
            .catch((err: Error) => {
              reject(err);
            });
        })
    });
  }

  removeCard(tag: Tag, card: Card): Promise<Tag> {
    return new Promise((resolve, reject) => {
      this.cardService
      .deleteCard(card)
      .then(()=>{
        const index = tag.cards.indexOf(card.id);
        if (index > -1) { 
          tag.cards.splice(index, 1); 
        }
        this
        .update(tag)
        .then((result: Tag) => {
          resolve(tag);
        })
      })
    });
  }

  setEvaluation(tag:Tag, evaluation:Evaluation):Promise<Evaluation>{
    return new Promise(async (resolve, reject) => {
      if (tag.evaluation){
        evaluation.created_at = new Date();
        evaluation.id = tag.evaluation;
        this
        .evaluationService
        .update(evaluation)
        .then((result: Evaluation) => {
          this.evaluationEvent.emit(tag.id);
          resolve(result);
        });
      }else{
        this
        .evaluationService
        .create(evaluation)
        .then((result: Evaluation) => {
          tag.evaluation = result.id;
          this
          .update(tag)
          .then((res: Tag) => {
            this.evaluationEvent.emit(tag.id);
            resolve(result);
          });
        });
      }
    });
  }

  getEvaluation(tag:Tag):Promise<Evaluation|null>{
    return new Promise(async (resolve, reject) => {
      if (tag.evaluation){
        this
        .evaluationService
        .find(tag.evaluation)
        .then((result: Evaluation) => {
          resolve(result);
        });
      }else{
        resolve(null);
      }
    });
  }

  clearEvaluation(tag:Tag):Promise<Tag>{
    return new Promise(async (resolve, reject) => {
      if (tag.evaluation){
        this
        .evaluationService
        .delete(tag.evaluation)
        .then(() => {
          tag.evaluation = null;
          this.update(tag).then(()=>{
            resolve(tag);
          });
        });
      }else{
        resolve(tag);
      }
    });
  }
}
