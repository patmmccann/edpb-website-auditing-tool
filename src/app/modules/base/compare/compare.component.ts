import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { CookieKnowledge } from 'src/app/models/knowledges/cookie-knowledge.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {
  @Input() knowledgesService: KnowledgesService | null = null;
  @Input() base: KnowledgeBase | null = null;
  @Input() updateKnowledges: CookieKnowledge[] = [];
  @Output() closeEvent = new EventEmitter();
  @Output() refreshEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter<number>();



  to_add: CookieKnowledge[] = [];
  to_remove: { id: number, value: CookieKnowledge }[] = [];
  showForm = false;
  showProgress = true;
  showModal = false;


  constructor(
    private knowledgeBaseService: KnowledgeBaseService
  ) {

  }

  ngOnInit(): void {
    if (this.base) {
      this.knowledgeBaseService
        .export(this.base.id)
        .then((data) => {
          const current = data.knowledges.map((x: any) => JSON.stringify(x));
          const updates = this.updateKnowledges.map(x => JSON.stringify(x));
          this.to_add = updates.filter(x => !current.includes(x)).map(x => JSON.parse(x));
          this.to_remove = current.filter((x: string) => !updates.includes(x)).map((x: string) => ({ id: current.indexOf(x), value: JSON.parse(x) }));
          this.showProgress = false;

          if (this.to_add.length == 0 && this.to_remove.length == 0) {
            this.showModal = true;
          }
        });
    }
  }

  apply_add(i: number) {
    if (this.knowledgesService && this.base) {
      const elt =  this.delete_add(i);
      this.knowledgesService
        .add(this.base.id, elt)
        .then((result: Knowledge) => {
          this.refreshEvent.emit();
        }).catch(() => {
          console.log("Update error! Cannot add item to knowledge database.");
          return;
        });
    }
  }

  delete_add(i: number) {
    const elt = this.to_add.splice(i, 1);
    if (this.to_remove.length == 0 && this.to_add.length == 0) {
      this.closeEvent.emit()
    }
    return elt[0];
  }

  apply_remove(i : number, id: number) {
    if (this.knowledgesService && this.base) {
      this.delete_remove(i);
      this.deleteEvent.emit(id);
    } 
  }

  delete_remove(i: number) {
    this.to_remove.splice(i, 1);
    if (this.to_remove.length == 0 && this.to_add.length == 0) {
      this.closeEvent.emit();
    }
  }

  async applyAll() {
    this.to_add.forEach((x,i) => this.apply_add(i));
    this.to_remove.forEach(x => this.deleteEvent.emit(x.id));
    this.closeEvent.emit();
    this.refreshEvent.emit();
  }
}
