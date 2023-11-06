import { EventEmitter, Injectable } from '@angular/core';

import { ApplicationDb } from '../application.db'
import { Card } from '../models/card.model';
import { Tag } from '../models/tag.model';
import { CardService } from './card.service';
import { Evaluation, Status } from '../models/evaluation.model';
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
   * Update a tag
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

  override async delete(id: number) {
    const tag = await this.find(id);

    for (let id of tag.cards) {
      await this.cardService.delete(id);
    }

    await this.clearEvaluation(tag);
    await super.delete(tag.id);
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
    cards_type?: string[],
    status?: Status
  ): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      if (!tag.cards) resolve([]);

      const tags = tag.cards.map(idx => this.cardService.find(idx));

      Promise.all(tags).then((x) => {
        let cards = cards_type ?
          x.filter(card => cards_type.includes(card.kind)) :
          x;

        if (!status) {
          resolve(cards);
        } else {
          const eval_promise = cards.map(card => this.cardService.getEvaluation(card));
          Promise.all(eval_promise)
            .then((evaluations) => {
              const match_ev = evaluations
                .filter(ev => ev?.status == status)
                .map(x => x?.id);
              resolve(cards.filter(card => card.evaluation ? match_ev.includes(card.evaluation) : false));
            });
        }
      });
    });
  }

  getAllCardsWithEvaluation(tag: Tag,
    cards_type?: string[],
    status?: Status
  ): Promise<{ card: Card, evaluation: Evaluation | null }[]> {
    return new Promise((resolve, reject) => {
      this.getAllCards(tag, cards_type, status)
        .then((cards) => {
          const eval_promise = cards.map(card => this.cardService.getEvaluation(card));
          Promise.all(eval_promise)
            .then((evaluations) => {
              resolve(cards.map((card, idx) => ({ card: card, evaluation: evaluations[idx] })));
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
        .delete(card.id)
        .then(() => {
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

  setEvaluation(tag: Tag, evaluation: Evaluation): Promise<Evaluation> {
    return new Promise(async (resolve, reject) => {
      if (tag.evaluation) {
        evaluation.created_at = new Date();
        evaluation.id = tag.evaluation;
        this
          .evaluationService
          .update(evaluation)
          .then((result: Evaluation) => {
            this.evaluationEvent.emit(tag.id);
            resolve(result);
          });
      } else {
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

  getEvaluation(tag: Tag): Promise<Evaluation | null> {
    return new Promise(async (resolve, reject) => {
      if (tag.evaluation) {
        this
          .evaluationService
          .find(tag.evaluation)
          .then((result: Evaluation) => {
            resolve(result);
          });
      } else {
        resolve(null);
      }
    });
  }

  async clearEvaluation(tag: Tag) {
    if (tag.evaluation) {
      await this
        .evaluationService
        .delete(tag.evaluation);
      tag.evaluation = null;
      await this.update(tag);
      return tag;
    } else {
      return tag;
    }
  }

  async export(id: number): Promise<any> {
    const tag = await this.find(id);
    const data: any = { ...tag };
    delete data.id;

    if (tag.evaluation) {
      const evaluation = await this.evaluationService.export(tag.evaluation);
      data.evaluation = evaluation;
    }

    const cards = [];
    for (let id of tag.cards) {
      const card = await this.cardService.export(id);
      cards.push(card);
    }
    data.cards = cards;

    return data;
  }

  override async find(id: number | string): Promise<Tag> {
    return super.find(id);
  }

  async parse(data: any) {
    if (data.evaluation) {
      const evaluation = await this.evaluationService.create(data.evaluation);
      data.evaluation = evaluation.id;
    }

    if (data.cards){
      const cards = [];

      for (const card of data.cards) {
        const new_card = await this.cardService.parse({...card});
        cards.push(new_card.id);
      }

      data.cards = cards;
    }

    return await this.create(data);
  }
}
