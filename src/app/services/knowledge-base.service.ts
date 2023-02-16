import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';
import { KnowledgeBase } from '../models/knowledgeBase.model';
import { CookieKnowledgesService, CookieSearch } from 'src/app/services/knowledges/cookie-knowledges.service';
import { CookieKnowledge } from '../models/knowledges/cookie-knowledge.model';
import { CookieLine } from '../models/cards/cookie-card.model';
import { LocalStorageLine } from '../models/cards/local-storage-card.model';
import { LocalstorageKnowledgesService } from './knowledges/localstorage-knowledges.service';
import { kindKnowledge, Knowledge } from '../models/knowledge.model';
import { LocalStorageKnowledge } from '../models/knowledges/localstorage-knowledge.model';

@Injectable({
  providedIn: 'root'
})

export class KnowledgeBaseService extends ApplicationDb {
  knowledgeBaseData: any = null;
  knowledgeBaseKind: kindKnowledge = null;
  knowledgeBaseSource:any={};

  q: string = "";
  filter: string = "";
  toHide = [];

  placeholder: string | null = null;
  constructor(
    private cookieKnowledgesService: CookieKnowledgesService,
    private localstorageKnowledgeService : LocalstorageKnowledgesService
  ) {
    super(1, 'knowledgeBase');
  }

  public getAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findAll()
        .then((response: any) => {
          const result: KnowledgeBase[] = [];

          if (response && response.length > 0) {
            response.forEach((e: any) => {
              result.push(
                new KnowledgeBase(
                  e.id,
                  e.name,
                  e.author,
                  e.category,
                  e.created_at
                )
              );
            });
          }
          resolve(result);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
  * Get a KnowledgeBase.
  * @param id - The KnowledgeBase id.
  * @returns - New Promise
  */
  async get(id: number): Promise<KnowledgeBase> {
    return new Promise((resolve, reject) => {
      this.find(id)
        .then((entry: any) => {
          resolve(entry);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
  * Create a new Structure.
  * @returns - New Promise
  */
  override async create(base: KnowledgeBase): Promise<any> {
    return new Promise((resolve, reject) => {
      super
        .create(base, 'knowledge_base')
        .then((res) => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  override async update(base: KnowledgeBase): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(base.id).then((entry: any) => {
        entry.name = base.name;
        entry.author = base.author;
        entry.category = base.category;
        entry.updated_at = new Date();

        super
          .update(base.id, entry, 'knowledge_base')
          .then((res) => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  /**
   * Download the Knowledges exported.
   * @param {number} id - The Structure id.
   */
  export(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(id).then((data: any) => {
        const knowledgeService = data.category == 'cookie'? this.cookieKnowledgesService : this.localstorageKnowledgeService;
        knowledgeService.getEntries(id).then(knowledges => {
          knowledges.forEach((knowledge:any) =>{
            if (knowledge.knowledge_base_id) delete knowledge.knowledge_base_id;
            if (knowledge.id) delete knowledge.id;
          })
          if (data.id) delete data.id;
          data.knowledges = knowledges;
          resolve(data);
        });
      });
    });
  }

      /**
   * Erase  delete method for an entry in the database.
   * @param {any} id - The record id.
   * @returns {Promise}
   */
     override async delete(id: number) {
      return new Promise((resolve, reject) => {
        this.find(id).then((data: KnowledgeBase) => {
          const knowledgeService = data.category == 'cookie'? this.cookieKnowledgesService : this.localstorageKnowledgeService;
          knowledgeService.getEntries(id).then(knowledges => {
            const delete_promises = knowledges.map((knowledge :any) => knowledgeService.delete(knowledge.id));
            delete_promises.push(super.delete(id));
            Promise.all(delete_promises)
            .then(()=>{
              resolve(id);
            })
          });
        });
      });
  }

  parseKnowledgeBase(data :any): Promise<KnowledgeBase>{
    return new Promise((resolve, reject) => {
      const newKnowledgeBase = new KnowledgeBase(
        0,
        data.name,
        data.author,
        data.category,
        new Date()
      );

      this.create(newKnowledgeBase)
        .then(async (resp: KnowledgeBase) => {
          let knowledgeService = null;

          if (data.category == 'cookie'){
            knowledgeService = this.cookieKnowledgesService;
          } else if (data.category == 'localstorage'){
            knowledgeService = this.localstorageKnowledgeService;
          }else {
            throw Error('unsupported category for knowledge base')
          }

          newKnowledgeBase.id = resp.id;
          for (const knowledge of data.knowledges) {
            if (knowledge.id) delete knowledge.id;
            await knowledgeService
              .add(newKnowledgeBase.id, knowledge)
              .then()
              .catch();
          }
          resolve(newKnowledgeBase);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }


  import(file: File): Promise<KnowledgeBase[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event2: any) => {
        const data = JSON.parse(event2.target.result);

        if(Array.isArray(data)){
          const knowledge_promises = data.map(knowlege => this.parseKnowledgeBase(knowlege));
          Promise.all(knowledge_promises)
          .then((all_knowledge)=>{
            resolve(all_knowledge);
          })

        }else{
          this.parseKnowledgeBase(data)
          .then((knowledgeBase)=>{
            resolve ([knowledgeBase]);
          })
        }
      };
    });
  }
  /**
     * Duplicate base and it's knowleges
     * @param id base's id
     */
  duplicate(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const date = new Date().getTime();
      this.find(id).then((data: KnowledgeBase) => {
        this.create(
          new KnowledgeBase(
            0,
            data.name + ' (copy)',
            data.author,
            data.category,
            new Date()
          )
        )
          .then((newKnowledgeBase: KnowledgeBase) => {

            if (data.category == 'cookie'){
            // Duplicate entries
            this.cookieKnowledgesService
              .getEntries(id)
              .then((knowledges: CookieKnowledge[]) => {
                knowledges.forEach((entry: CookieKnowledge) => {
                  const temp = new CookieKnowledge();
                  temp.domain = entry.domain;
                  temp.name = entry.name;
                  temp.source = entry.source;
                  temp.controller = entry.controller;
                  temp.policy = entry.policy;
                  temp.category = entry.category;
                  temp.reference = entry.reference;
                  temp.comment = entry.comment;
                  temp.created_at = new Date(entry.created_at);
                  temp.updated_at = new Date(entry.updated_at);
                  this.cookieKnowledgesService
                    .add(newKnowledgeBase.id, temp)
                    .then(e => {
                      console.log(e);
                      resolve();
                    })
                    .catch(err => {
                      reject(err);
                    });
                });
              });
            }else if (data.category == 'localstorage'){
                          // Duplicate entries
            this.localstorageKnowledgeService
            .getEntries(id)
            .then((knowledges: LocalStorageKnowledge[]) => {
              knowledges.forEach((entry: LocalStorageKnowledge) => {
                const temp = new LocalStorageKnowledge();
                temp.key = entry.key;
                temp.script = entry.script;
                temp.source = entry.source;
                temp.controller = entry.controller;
                temp.policy = entry.policy;
                temp.category = entry.category;
                temp.reference = entry.reference;
                temp.comment = entry.comment;
                temp.created_at = new Date(entry.created_at);
                temp.updated_at = new Date(entry.updated_at);
                this.localstorageKnowledgeService
                  .add(newKnowledgeBase.id, temp)
                  .then(e => {
                    console.log(e);
                    resolve();
                  })
                  .catch(err => {
                    reject(err);
                  });
              });
            });
            }

          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }




  /**
   * Global search method.
   * @param filter - Text to search.
   * @param event - Any Event.
   */
  search(value: CookieLine | LocalStorageLine, kind: string): void {

    switch (kind) {
      case "cookie":
        const cookeLine = value as CookieLine;
        this.knowledgeBaseSource= {'domain':cookeLine.domain, 'name':cookeLine.name};
        this.cookieKnowledgesService.getCookieEntries(cookeLine.domain, cookeLine.name).then(result => {
          if (result.matched){
            this.knowledgeBaseData = result;
          }else{
            this.knowledgeBaseData = null;
          }
          this.knowledgeBaseKind = 'cookie';
        });
        break;

      case "localstorage":
        const localstorageLine = value as LocalStorageLine;
        this.knowledgeBaseSource= {'key':localstorageLine.key, 'script':localstorageLine.log.stacks[0]?.fileName};
        this.localstorageKnowledgeService.getLocalStorageEntries(localstorageLine.key, localstorageLine.log).then(result => {
          if (result.length >0 ){
            this.knowledgeBaseData = result;
          }else{
            this.knowledgeBaseData = null;
          }
          this.knowledgeBaseKind = 'localstorage';
        });
        break;
      default:
        this.knowledgeBaseData = null;
        this.knowledgeBaseKind = null;
    }

  }

  /**
   * Load knowledge base by item.
   * @param item - An item of a section.
   * @param event - List of Events.
   */
  loadByItem(item: any, event?: any): void {
    //if (this.allKnowledgeBaseData && item) {
    /*this.knowledgeBaseData = this.allKnowledgeBaseData;
    let kbSlugs = [];
    if (item.link_knowledge_base && item.link_knowledge_base.length > 0) {
      kbSlugs = item.link_knowledge_base;
    } else if (item.is_measure) {
      const kbSlugs2 = this.knowledgeBaseData.filter(kbItem => {
        return kbItem.filters.startsWith('measure.');
      });
      kbSlugs2.forEach(element => {
        kbSlugs.push(element.slug);
      });
    } else if (item.questions) {
      item.questions.forEach(question => {
        if (question.link_knowledge_base) {
          question.link_knowledge_base.forEach(kbElement => {
            kbSlugs.push(kbElement);
          });
        }
      });
    }

    if (kbSlugs.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter(kbItem => {
        return kbSlugs.indexOf(kbItem.slug) >= 0;
      });
    } else {
      this.knowledgeBaseData = [];
    }*/
    //}
  }

}
