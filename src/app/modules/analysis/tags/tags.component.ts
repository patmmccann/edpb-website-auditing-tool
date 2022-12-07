import { Component, OnInit, Input } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { Tag } from 'src/app/models/tag.model';
import { AnalysisService } from 'src/app/services/analysis.service';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  @Input() analysis: Analysis = new Analysis();
  @Input() tag: Tag = new Tag("");
  evaluation: Evaluation | null = null;
  constructor(
    public tagService: TagService,
  ) { }

  ngOnInit(): void {
    this.tagService.getEvaluation(this.tag).then((evaluation) => {
      this.evaluation = evaluation;
    });

    this.tagService.evaluationEvent.subscribe(idx => {
      if (this.tag.id == idx) {
        this.tagService.getEvaluation(this.tag).then((evaluation) => {
          this.evaluation = evaluation;
        });
      }
    });
  }
}
