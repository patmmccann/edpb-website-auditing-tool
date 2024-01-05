/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Injectable } from '@angular/core';
import { LocalStorageKnowledge } from 'src/app/models/knowledges/localstorage-knowledge.model';
import { KnowledgesService } from '../knowledges.service';
import { Knowledge } from 'src/app/models/knowledge.model';
import { Log } from 'src/app/models/cards/log.model';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageKnowledgesService extends KnowledgesService {

  constructor() {
    super('localstorageKnowledge', [
      { indexName: 'index_key', keyPath: 'key', unique: false },
      { indexName: 'index_script', keyPath: 'script', unique: false }
    ]);

  }

  override async update(knowledge: Knowledge): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(knowledge.id).then((entry: any) => {

        const localStorageKnowledge = knowledge as LocalStorageKnowledge;
        entry.key = localStorageKnowledge.key;
        entry.script = localStorageKnowledge.script;
        entry.source = localStorageKnowledge.source;
        entry.controller = localStorageKnowledge.controller;
        entry.policy = localStorageKnowledge.policy;
        entry.category = localStorageKnowledge.category;
        entry.reference = localStorageKnowledge.reference;
        entry.comment = localStorageKnowledge.comment;
        entry.knowledge_base_id = localStorageKnowledge.knowledge_base_id;
        entry.created_at = localStorageKnowledge.created_at;
        entry.updated_at = new Date();

        super
          .update(entry.id, entry)
          .then((result) => {
            resolve(result);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      });
    });
  }

  async duplicate(baseId: number, id: number): Promise<Knowledge> {
    return new Promise((resolve, reject) => {
      this.find(id).then((entry: Knowledge) => {

        const entry_cookie = entry as LocalStorageKnowledge;
        const temp = new LocalStorageKnowledge();
        temp.key = entry_cookie.key;
        temp.script = entry_cookie.script;
        temp.source = entry_cookie.source;
        temp.controller = entry_cookie.controller;
        temp.policy = entry_cookie.policy;
        temp.category = entry_cookie.category;
        temp.reference = entry_cookie.reference;
        temp.comment = entry_cookie.comment;
        temp.created_at = entry_cookie.created_at;
        temp.updated_at = entry_cookie.updated_at;


        this.add(baseId, temp)
          .then((result: Knowledge) => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
            console.error(err);
          });

      });
    });
  }

  public getLocalStorageEntries(key: string, log: Log): Promise<any> {
    return new Promise((resolve, reject) => {
      const searchPromises: Promise<Array<LocalStorageKnowledge>>[] = [];

      searchPromises.push(this.findAllByKey(key));
      for (let stack of log.stacks) {
        searchPromises.push(this.findAllByScript(stack.fileName));
      }

      Promise.all(searchPromises).then((allresults) => {
        resolve(allresults.flat());
      });

    });
  }

  /**
  * List all Knowledge by base id
  * @param baseId Id of base
  */
  private async findAllByKey(key: string): Promise<Array<LocalStorageKnowledge>> {
    return new Promise((resolve, reject) => {
      if (!key) return resolve([]);
      super
        .findAll({ index: 'index_key', value: key })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

  /**
* List all Knowledge by base id
* @param baseId Id of base
*/
  private async findAllByScript(script: string): Promise<Array<LocalStorageKnowledge>> {
    return new Promise((resolve, reject) => {
      if (!script) return resolve([]);
      super
        .findAll({ index: 'index_script', value: script })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

}
