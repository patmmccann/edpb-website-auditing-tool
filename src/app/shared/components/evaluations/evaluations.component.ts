import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Analysis } from 'src/app/models/analysis.model';
import { Card } from 'src/app/models/card.model';
import { Evaluation, Status } from 'src/app/models/evaluation.model';
import { Tag } from 'src/app/models/tag.model';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit, OnChanges {
  @Input() evaluation: Evaluation = new Evaluation();
  @Input() card: Card | null = null;

  evaluationForm: FormGroup = new FormGroup({
    evaluationComment: new FormControl()
  });

  editorEvaluationComment: any;
  evaluationCommentElementId: string = "";
  comment_placeholder: string = "";
  reference_to: string = "";
  hasResizedContent: boolean = false;
  @Input() cardId: number = 0;
  @Output() evaluationEvent = new EventEmitter<Evaluation>();

  constructor(
    private evaluationService: EvaluationService,
    private knowledgeBaseService: KnowledgeBaseService,
  ) {


  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.card?.kind == 'global'){
      this.evaluationForm.controls['evaluationComment'].patchValue(this.evaluation.evaluation_comment);     
    }
  }

  ngOnInit(): void {

    if (this.card){
      this.evaluationCommentElementId = "evaluation-comment-"+this.card.id;
      if (this.card.evaluation){
        this.evaluationService.find(this.card.evaluation)
        .then((evaluation)=>{
          this.evaluation = evaluation;
          this.evaluationForm.controls['evaluationComment'].patchValue(evaluation.evaluation_comment);
        });
      }
      
    }
    
  }

  ngOnDestroy(): void {
    tinymce.remove(this.editorEvaluationComment);
  }

  ngDoCheck(): void {
    if (this.card) {
      this.reference_to = this.card.id.toString();
    }
  }

  ngAfterViewChecked(): void {
    if (this.evaluation) {
      // Evaluation comment textarea auto resize
      const evaluationCommentTextarea = document.querySelector(
        '.evaluation-comment-' + this.evaluation.id
      );
      if (!this.hasResizedContent && evaluationCommentTextarea) {
        this.hasResizedContent = true;
        if (evaluationCommentTextarea) {
          this.autoTextareaResize(null, evaluationCommentTextarea);
        }
      }
    }
  }

  /**
 * Updates evaluation fields according to the selected button.
 * @param {Event} event - Any event.
 * @param {number} status - The status of the evaluation (to be fixed, improvable, acceptable).
 */
  selectedButton(event: Event, status: Status): void {
    this.evaluation.status = status;
    this.evaluationEvent.emit(this.evaluation);
  }

  /**
   * Activates (or not) evaluation comment when focusing it.
   */
  evaluationCommentFocusIn(): void {
    this.knowledgeBaseService.placeholder = this.comment_placeholder;
    this.loadEditor('evaluationComment', true);
  }

  /**
 * Executes actions when losing focus from evaluation comment.
 */
  evaluationCommentFocusOut(): void {
    this.knowledgeBaseService.placeholder = null;
    this.editorEvaluationComment = false;
    let userText = this.evaluationForm.controls['evaluationComment'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.evaluation.evaluation_comment = userText;

    let evaluation = this.evaluation.id ?
    this.evaluationService.update(this.evaluation)
      :  this.evaluationService.create(this.evaluation);

    evaluation.then((evaluation) => {
      this.evaluationEvent.emit(evaluation);
    });
  }

  /**
   * Auto textearea resize
   * @param {*} event - Any Event.
   * @param {*} [textarea] - Any textarea element.
   */
  autoTextareaResize(event: any, textarea?: any): void {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.height =
        textarea.scrollHeight * 2 - textarea.clientHeight + 'px';
    }
  }

  /**
  * Loads WYSIWYG editor for action plan comment.
  * @param {any} field - Field to load the editor.
  * @param {boolean} [autofocus=false] - Boolean to autofocus or not.
  */
  loadEditor(field: any, autofocus = false): void {
    let elementId = this.evaluationCommentElementId;;

    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      content_css:'tinymce/skins/content/default/content.css',
      plugins: 'lists',
      autoresize_bottom_margin: 30,
      auto_focus: autofocus ? elementId : '',
      autoresize_min_height: 40,
      selector: '#' + elementId,
      toolbar:
        'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin: false,
      setup: (editor: any) => {
        this.editorEvaluationComment = editor;
      }
    });
  }

  onNoClick(){
    this.evaluationForm.controls['evaluationComment'].patchValue(this.editorEvaluationComment.getContent());
    this.evaluationCommentFocusOut();
    tinymce.remove(this.editorEvaluationComment);
  }
}


