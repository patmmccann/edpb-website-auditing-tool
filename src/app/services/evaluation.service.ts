import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';
import { Evaluation } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService extends ApplicationDb {


  constructor() {
    super(1, 'evaluation');
  }

  override async update(evaluation: Evaluation): Promise<Evaluation> {
    return new Promise((resolve, reject) => {
      super.find(evaluation.id).then((entry: any) => {
        entry = {
          ...entry,
          ...evaluation
        };
        entry.updated_at = new Date();
        super
          .update(entry.id, entry, null, this.setFormData(entry))
          .then(result => {
            resolve(evaluation);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  private setFormData(data: any) {
    const formData = new FormData();
    for (const d in data) {
      if (data.hasOwnProperty(d) && data[d]) {
        formData.append('evaluation[' + d + ']', data[d]);
      }
    }
    return formData;
  }

  override async find(id: number | string): Promise<Evaluation> {
    return super.find(id);
  }

  async export(id: number): Promise<any> {
    const evaluation = await this.find(id);
    const data :any = { ...evaluation };
    delete data.id;
    return data;
  }
}
