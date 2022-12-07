import { Component, OnInit,Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Card } from 'src/app/models/card.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { GlobalCard } from 'src/app/models/cards/global-card.model';
import { Tag } from 'src/app/models/tag.model';
import { CardService } from 'src/app/services/card.service';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnChanges {
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
  @Input() evaluation: Evaluation  = new Evaluation();
  @Output() evaluationEvent = new EventEmitter<Evaluation>();
  loading: boolean = false;
  global_card:GlobalCard = new GlobalCard("Global Evaluation");
  cards: Card[] = [];

  constructor(
    private tagService: TagService
  ) { 
    
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.analysis && this.tag){
      this.global_card = new GlobalCard(this.analysis.name + " > "+ this.tag.name);
    }else if (this.analysis){
      this.global_card = new GlobalCard(this.analysis.name);
    }
    this.refreshCards();
  }

  refreshCards():void{
    if (this.tag){
      this.tagService.getAllCards(this.tag).then( cards => {
        this.cards = cards;
      });
    }
  }
}
