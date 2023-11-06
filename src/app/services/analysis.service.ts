import { EventEmitter, Injectable, Output } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Tag } from '../models/tag.model';
import { ApplicationDb } from '../application.db';
import { TagService } from 'src/app/services/tag.service';
import { Card } from '../models/card.model';
import { Evaluation, Status } from '../models/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { promises } from 'fs-extra';

export interface AnalysisAndTag {
  analysis: Analysis,
  tag: Tag
}


@Injectable({
  providedIn: 'root'
})
export class AnalysisService extends ApplicationDb {

  public evaluationEvent = new EventEmitter<number>();
  public deleteTagEvent = new EventEmitter<number>();

  constructor(
    private tagService: TagService,
    private evaluationService: EvaluationService
  ) {
    super(1, 'analysis');
  }

  /**
   * Create a new Analysis
   */
  async saveNewAnalysis(analysisForm: Analysis, firstTag: Tag, cards: Card[]): Promise<AnalysisAndTag> {
    return new Promise((resolve, reject) => {
      const analysis: Analysis = {
        ...analysisForm
      };

      this.tagService
        .saveNewTag(firstTag, cards)
        .then(newTag => {
          analysis.tags = [newTag.id];
          analysis.created_at = new Date();
          analysis.updated_at = new Date();

          super
            .create(analysis)
            .then((newAnalysis: Analysis) => {
              resolve({ analysis: newAnalysis, tag: newTag });
            })
            .catch((err: Error) => {
              reject(err);
            });
        });
    });
  }

  /**
   * Add a new tag
   */
  async addTag(analysis: Analysis, tag: Tag, cards: Card[]): Promise<AnalysisAndTag> {
    return new Promise((resolve, reject) => {
      this.tagService
        .saveNewTag(tag, cards)
        .then(newTag => {
          analysis.tags.push(newTag.id);
          analysis.created_at = new Date();
          analysis.updated_at = new Date();

          this
            .update(analysis)
            .then((newAnalysis: Analysis) => {
              resolve({ analysis: analysis, tag: newTag });
            })
            .catch((err: Error) => {
              reject(err);
            });
        });
    });
  }

  /**
  * Find all entries without conditions.
  * Many result items (cursor for indexedDb)
  * @returns {Promise}
  */
  override async findAll(withIndex?: { index: string; value: any }): Promise<any[]> {
    const items: Array<Analysis> = [];
    return new Promise((resolve, reject) => {

      this.getObjectStore().then(() => {
        let evt;
        let index1;

        if (this.objectStore) {
          if (withIndex) {
            index1 = this.objectStore.index(withIndex.index);
            evt = index1.openCursor(IDBKeyRange.only(withIndex.value));
          } else {
            evt = this.objectStore.openCursor();
          }

          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          };
        } else {
          reject(new Error('No database loaded'));
        }
      });
    });
  }

  /**
   * Find all entries without conditions.
   * @returns {Promise} - Return new Promise
   */
  getAllActives(): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll().then((entries: any) => {
        resolve(
          entries
        );
      });
    });
  }

  /**
   * Find all tags for a given analysis.
   * @returns {Promise} - Return new Promise
   */
  getAllTags(analysis: Analysis,
    status?: Status): Promise<Tag[]> {
    return new Promise((resolve, reject) => {
      const tags = analysis.tags.map(idx => this.tagService.find(idx));

      Promise.all(tags).then((x) => {
        const tags = x.flat();
        if (!status) {
          resolve(tags);
        } else {
          const eval_promise = tags.map(tag => this.tagService.getEvaluation(tag));
          Promise.all(eval_promise)
            .then((evaluations) => {
              const match_ev = evaluations
                .filter(ev => ev?.status == status)
                .map(x => x?.id);
              resolve(tags.filter(tag => tag.evaluation ? match_ev.includes(tag.evaluation) : false));
            });
        }
      });
    });
  }

  /**
   * Find all tags for a given analysis.
   * @returns {Promise} - Return new Promise
   */
  getAllTagsEvaluations(analysis: Analysis): Promise<(Evaluation | null)[]> {
    return new Promise((resolve, reject) => {
      this.getAllTags(analysis).then((tags) => {
        const eval_promise = tags.map(tag => this.tagService.getEvaluation(tag));
        Promise.all(eval_promise)
          .then((evaluations) => {
            resolve(evaluations.flat());
          });
      })
    })
  }


  getAllTagsWithEvaluation(analysis: Analysis): Promise<{ tag: Tag, evaluation: Evaluation | null }[]> {
    return new Promise((resolve, reject) => {
      this.getAllTags(analysis)
        .then((tags) => {
          const eval_promise = tags.map(tag => this.tagService.getEvaluation(tag));
          Promise.all(eval_promise)
            .then((evaluations) => {
              resolve(tags.map((tag, idx) => ({ tag: tag, evaluation: evaluations[idx] })));
            });
        })
    });
  }

  /**
   * Find a given tag for the analysis.
   * @returns {Promise} - Return new Promise
   */
  getTag(analysis: Analysis, tagId: number): Promise<Tag> {
    return new Promise((resolve, reject) => {
      this.getAllTags(analysis).then(tags => {
        const tag = tags.filter(x => x.id == tagId)[0];
        resolve(tag);
      })
    });
  }

  /**
 * Find a given tag for the analysis.
 * @returns {Promise} - Return new Promise
 */
  getAnalysisAndTag(analysisId: number, tagId: number): Promise<AnalysisAndTag> {
    return new Promise((resolve, reject) => {
      this.find(analysisId)
        .then((analysis: Analysis) => {
          this.getTag(analysis, tagId).then(tag => {
            resolve({ analysis: analysis, tag: tag })
          });
        });
    });
  }



  override update(analysis: Analysis, date?: Date | null): Promise<any> {
    return new Promise((resolve, reject) => {
      super.find(analysis.id).then((entry: any) => {
        entry = {
          ...entry,
          ...analysis
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

  deleteAnalysis(analysis: Analysis): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const tags = await this.getAllTags(analysis);
      for (let tag of tags) {
        await this.removeTag(analysis, tag);
      }
      await this.clearEvaluation(analysis);
      await this.delete(analysis.id);
      resolve();
    });
  }

  removeTag(analysis: Analysis, tag: Tag): Promise<Analysis> {
    return new Promise(async (resolve, reject) => {
      await this.tagService.deleteTag(tag);

      const index = analysis.tags.indexOf(tag.id);
      if (index > -1) {
        analysis.tags.splice(index, 1);
      }
      this
        .update(analysis)
        .then((result: Analysis) => {
          this.deleteTagEvent.emit(analysis.id);
          resolve(analysis);
        })
    });
  }

  setEvaluation(analysis: Analysis, evaluation: Evaluation): Promise<Evaluation> {
    return new Promise(async (resolve, reject) => {
      if (analysis.evaluation) {
        evaluation.id = analysis.evaluation;
        evaluation.created_at = new Date();
        this
          .evaluationService
          .update(evaluation)
          .then((result: Evaluation) => {
            this.evaluationEvent.emit(analysis.id);
            resolve(result);
          });
      } else {
        this
          .evaluationService
          .create(evaluation)
          .then((result: Evaluation) => {
            analysis.evaluation = result.id;
            this
              .update(analysis)
              .then((res: Analysis) => {
                this.evaluationEvent.emit(analysis.id);
                resolve(result);
              });
          });
      }
    });
  }

  getEvaluation(analysis: Analysis): Promise<Evaluation | null> {
    return new Promise(async (resolve, reject) => {
      if (analysis.evaluation) {
        this
          .evaluationService
          .find(analysis.evaluation)
          .then((result: Evaluation) => {
            resolve(result);
          });
      } else {
        resolve(null);
      }
    });
  }

  clearEvaluation(analysis: Analysis): Promise<Analysis> {
    return new Promise(async (resolve, reject) => {
      if (analysis.evaluation) {
        this
          .evaluationService
          .delete(analysis.evaluation)
          .then(() => {
            analysis.evaluation = null;
            this.update(analysis).then(() => {
              resolve(analysis);
            });
          });
      } else {
        resolve(analysis);
      }
    });
  }

  async export(id: number): Promise<any> {
    const analysis = await this.find(id);
    const data: any = { ...analysis };
    delete data.id;

    if (analysis.evaluation) {
      const evaluation = await this.evaluationService.export(analysis.evaluation);
      data.evaluation = evaluation;
    }


    const tags = [];
    for (let id of analysis.tags) {
      const tag = await this.tagService.export(id);
      tags.push(tag);
    }
    data.tags = tags;
    return data;
  }

  override async find(id: number | string): Promise<Analysis> {
    return super.find(id);
  }
}
