import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { CookieKnowledge } from 'src/app/models/knowledges/cookie-knowledge.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { MatCard, MatCardHeader, MatCardSubtitle, MatCardContent, MatCardActions, MatCardFooter } from '@angular/material/card';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBar, ProgressBarMode } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
  imports: [MatMenuModule, MatCard, MatCardHeader, MatCardSubtitle, MatCardContent, MatAccordion, ModalComponent, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatCardActions, MatButtonModule, MatCardFooter, MatProgressBar, TranslateModule, MatIconModule]
})
export class CompareComponent implements OnInit {
  @Input() knowledgesService: KnowledgesService | null = null;
  @Input() base: KnowledgeBase | null = null;
  @Input() updateKnowledges: CookieKnowledge[] = [];
  @Output() closeEvent = new EventEmitter();
  @Output() refreshEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter<number | number[] >();



  to_add: CookieKnowledge[] = [];
  to_remove: { id: number, value: CookieKnowledge }[] = [];
  showForm = false;
  showProgress = true;
  showModal = false;

  mode: ProgressBarMode = 'indeterminate';
  progressValue = 0;
  progresComplete = 0;

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
      const elt = this.delete_add(i);
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

  apply_remove(i: number, id: number) {
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
    this.applyDeleteAll();
    await this.applyAddAll();
  }

  async applyDeleteAll() {
    const ids = this.to_remove.map(x => x.id);
    this.deleteEvent.emit(ids);
    this.to_remove = [];
    this.refreshEvent.emit();    
  }

  async applyAddAll() {
    this.showProgress = true;
    //this.mode = 'determinate';
    //this.progresComplete = this.to_add.length;
    
    if (this.knowledgesService && this.base) {
        await this.knowledgesService.addAll(this.base.id, this.to_add);
    }

    this.showProgress = false;
    this.to_add = [];
    this.refreshEvent.emit();
  }
}
