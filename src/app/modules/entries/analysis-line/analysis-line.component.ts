import { Component, OnInit,  Input, Output, EventEmitter } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Tag } from 'src/app/models/tag.model';
import { ActivatedRoute } from '@angular/router';
import { AnalysisService } from 'src/app/services/analysis.service';
import { Evaluation } from 'src/app/models/evaluation.model';
import { BrowserService } from 'src/app/services/browser.service';

@Component({
  selector: 'app-analysis-line',
  templateUrl: './analysis-line.component.html',
  styleUrls: ['./analysis-line.component.scss']
})
export class AnalysisLineComponent implements OnInit {
  @Input() analysis: Analysis = new Analysis();
  public tags : Tag[] = [];
  public analysis_evaluation : Evaluation | null = null;
  public tags_evaluation : (Evaluation | null)[] = [];
  @Output() deleted = new EventEmitter();

  constructor(
    public analysisService: AnalysisService,
    private browserService : BrowserService
  ) { }

  ngOnInit(): void {

    this.analysisService
    .getEvaluation(this.analysis)
    .then((evaluation)=>{
      this.analysis_evaluation = evaluation;
    })

    this.analysisService
    .getAllTags(this.analysis)
    .then((tags) => {
      this.tags = tags;
     });

     this.analysisService
     .getAllTagsEvaluations(this.analysis)
     .then((evaluations)=>{
       this.tags_evaluation = evaluations;
     });
  }

  delete():void{
    this.analysisService
    .getAllTags(this.analysis)
    .then(tags=>{
      tags.forEach(tag => this.browserService.deleteSession(window, this.analysis, tag));
    })


    this.analysisService
    .deleteAnalysis(this.analysis)
    .then(()=>{
      this.deleted.emit();
    });
  }
}
