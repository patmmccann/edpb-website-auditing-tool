/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ApplicationDb, Indexes } from 'src/app/classes/application.db';
import { Knowledge } from 'src/app/models/knowledge.model';


export class KnowledgesService extends ApplicationDb {

  constructor(knowledgeCategory: string, indexes: Indexes[]) {
    indexes.push({ indexName: 'index_knowledge_base_id', keyPath: 'knowledge_base_id', unique: false })
    super(1, knowledgeCategory, indexes);
  }

  public getEntries(baseId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findAllByBaseId(baseId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Create a new Knowledge ENTRY.
   * @returns - New Promise
   */
  async add(baseId: number, knowledge: Knowledge): Promise<Knowledge> {
    this.knowledge_base_id = baseId;
    knowledge.knowledge_base_id = baseId;

    return new Promise((resolve, reject) => {
      super
        .create(knowledge, 'knowledge')
        .then((res: Knowledge) => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async addAll(baseId: number, knowledges: Knowledge[]): Promise<Knowledge[]> {
    this.knowledge_base_id = baseId;
    const promises = knowledges.map(knowledge => this.add(baseId, knowledge));
    return await Promise.all(promises);
  }

  async deleteAll(baseIds: number[]) {
    baseIds.forEach(async baseId => await this.delete(baseId));
  }

  /**
   * List all Knowledge by base id
   * @param baseId Id of base
   */
  private async findAllByBaseId(baseId: number): Promise<Array<Knowledge>> {
    return new Promise((resolve, reject) => {
      this.knowledge_base_id = baseId;
      super
        .findAll({ index: 'index_knowledge_base_id', value: baseId })
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
