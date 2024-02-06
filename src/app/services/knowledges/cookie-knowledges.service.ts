/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Injectable } from '@angular/core';
import { KnowledgesService } from '../knowledges.service';
import { CookieKnowledge } from 'src/app/models/knowledges/cookie-knowledge.model';
import { Knowledge } from 'src/app/models/knowledge.model';

export interface CookieSearch {
  name_and_domain: CookieKnowledge[],
  name: CookieKnowledge[],
  domain: CookieKnowledge[],
  matched :boolean
}

@Injectable({
  providedIn: 'root'
})

export class CookieKnowledgesService extends KnowledgesService {
  constructor() {
    super('cookieKnowledge', [
      { indexName: 'index_domain', keyPath: 'domain', unique: false },
      { indexName: 'index_name', keyPath: 'name', unique: false }
    ]);
  }

  public getCookieEntries(domain: string, name: string): Promise<CookieSearch> {
    return new Promise((resolve, reject) => {
      const searchPromises: Promise<Array<CookieKnowledge>>[] = [];

      if (name){
        searchPromises.push(this.findAllByName(name));
      }
      if (domain){
        searchPromises.push(this.findAllByDomain(domain));
      }

      Promise.all(searchPromises).then((allresults) => {
        const searchName = allresults[0];
        const searchDomain = allresults[1];

        let name :any= [];
        let name_and_domain :any= [];
        let domain :any= [];
        
        if (searchName){
          name = searchName.filter(entryName => entryName.domain == "*");
        }
        if (searchDomain){
          domain = searchDomain.filter(entryName => searchName.some(entryDomain => entryName.id != entryDomain.id));
        }

        if (searchName && searchDomain){
          name_and_domain = searchDomain.filter(entryName => searchName.some(entryDomain => entryName.id == entryDomain.id));
        }
        
        
       

        resolve({
          name_and_domain: name_and_domain,
          name: name,
          domain: domain,
          matched : name_and_domain.length >0 || name.length >0 || domain.length >0
        });
      });

    });
  }

  /**
   * List all Knowledge by base id
   * @param baseId Id of base
   */
  private async findAllByDomain(domain: string): Promise<Array<CookieKnowledge>> {
    return new Promise((resolve, reject) => {
      if (!domain)resolve([]);
      super
        .findAll({ index: 'index_domain', value: domain })
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
  private async findAllByName(name: string): Promise<Array<CookieKnowledge>> {
    return new Promise((resolve, reject) => {
      if (!name)resolve([]);
      super
        .findAll({ index: 'index_name', value: name })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

  override async update(knowledge: Knowledge): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(knowledge.id).then((entry: any) => {

        const cookieKnowledge = knowledge as CookieKnowledge;
        entry.domain = cookieKnowledge.domain;
        entry.name = cookieKnowledge.name;
        entry.source = cookieKnowledge.source;
        entry.controller = cookieKnowledge.controller;
        entry.policy = cookieKnowledge.policy;
        entry.category = cookieKnowledge.category;
        entry.reference = cookieKnowledge.reference;
        entry.comment = cookieKnowledge.comment;
        entry.knowledge_base_id = cookieKnowledge.knowledge_base_id;
        entry.created_at = cookieKnowledge.created_at;
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

        const entry_cookie = entry as CookieKnowledge;
        const temp = new CookieKnowledge();
        temp.domain = entry_cookie.domain;
        temp.name = entry_cookie.name;
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

}
