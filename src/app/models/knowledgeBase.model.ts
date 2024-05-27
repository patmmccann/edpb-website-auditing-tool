/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Knowledge } from './knowledge.model';

export type TrustLevel = 
'validated' |
'reliable' |
'informative'|
'undefined';

export type KnowledgeCategory = 
''|
'cookie' |
'localstorage';


export const allTrustLevel : TrustLevel[] =[
    'validated',
    'reliable' ,
    'informative',
    'undefined'
] 

export class KnowledgeBase {
    public id: number = -1;
    public name: string;
    public author: string;
    public category: KnowledgeCategory;
    public knowledges: Knowledge[] = [];
    public created_at: Date;
    public trustLevel: TrustLevel;
    public used: boolean;
    
    constructor(id :number, name :string, author :string, category : KnowledgeCategory, createdAt :Date, trustLevel : TrustLevel, used:boolean) {
      this.id = id;
      this.name = name;
      this.author = author;
      this.category = category;
      this.created_at = createdAt;
      this.trustLevel = trustLevel;
      this.used = used;
    }
}
