import { Knowledge } from './knowledge.model';

export class KnowledgeBase {
    public id: number = -1;
    public name: string;
    public author: string;
    public category: string;
    public knowledges: Knowledge[] = [];
    public created_at: Date;
    
    constructor(id :number, name :string, author :string, category : string, createdAt :Date) {
      this.id = id;
      this.name = name;
      this.author = author;
      this.category = category;
      this.created_at = createdAt;
    }
}
