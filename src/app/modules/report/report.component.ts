import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AnalysisService } from 'src/app/services/analysis.service';
import { Tag } from 'src/app/models/tag.model';
import { TagService } from 'src/app/services/tag.service';
import { CardService } from 'src/app/services/card.service';
import { Card, kindCard } from 'src/app/models/card.model';
import { ReportService } from 'src/app/services/report.service';
import { TemplateService } from 'src/app/services/template.service';
import { Template } from 'src/app/models/template.model';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { BrowserService } from 'src/app/services/browser.service';
import { FormControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
  public analysis: Analysis = new Analysis();
  public tag: Tag | null = null;
  public card: Card | null = null;
  public templates: Template[] = [];
  public editing: boolean = false;
  pug: string = "";
  json: any = null;
  selected_template: Template | null = null;
  reportEditor: any = null;
  report_level: 'analysis' | 'tag' | 'card' = 'analysis';
  cards_options: string[] = [];
  tags_options: string[] = [];
  evaluation_options: string[] = ['No evaluation', 'Compliant', 'Not compliant', 'To be defined', 'Comments'];
  cards_to_display: FormControl<string[] | null> = new FormControl([]);
  tags_to_display: FormControl<string[] | null> = new FormControl([]);
  evaluations_to_display: FormControl<string[] | null> = new FormControl([]);

  @ViewChild('allSelectedEvaluation') private allSelectedEvaluation: MatOption | null = null;
  @ViewChild('allSelectedTag') private allSelectedTag: MatOption | null = null;
  @ViewChild('allSelectedCard') private allSelectedCard: MatOption | null = null;

  constructor(
    private route: ActivatedRoute,
    private analysisService: AnalysisService,
    private tagService: TagService,
    private cardService: CardService,
    private reportService: ReportService,
    private templateService: TemplateService,
    private browserService: BrowserService
  ) { }

  ngOnInit(): void {


    Promise.all([this.getAnalysis(),
    this.getTag(),
    this.getCard()])
      .then(() => {
        this.templateService.getAll().then((result: any) => {

          if (this.card) {
            this.report_level = 'card';
          } else if (this.tag) {
            this.report_level = 'tag';
          } else if (this.analysis) {
            this.report_level = 'analysis';
          }

          this.showOptions();

          this.cards_to_display
            .patchValue(['All cards']);
          this.tags_to_display
            .patchValue(['All tags']);
          this.evaluations_to_display
            .patchValue(['All evaluations']);

          this.selected_template = result[0];
          this.templates = result;
          this.rendererHTML();
        });
      })
  }

  ngOnDestroy(): void {
    if (tinymce)
      tinymce.remove(this.reportEditor);
  }

  toggleAllTagSelection() {
    if (this.allSelectedTag && this.allSelectedTag.selected) {
      this.tags_to_display
        .patchValue(['All tags']);
    } else {
      this.tags_to_display.patchValue([]);
    }
    this.rendererHTML();
  }

  toggleAllCardsSelection() {
    if (this.allSelectedCard && this.allSelectedCard.selected) {
      this.cards_to_display
        .patchValue(['All cards']);
    } else {
      this.cards_to_display.patchValue([]);
    }
    this.rendererHTML();
  }

  toggleAllEvaluationsSelection() {
    if (this.allSelectedEvaluation && this.allSelectedEvaluation.selected) {
      this.evaluations_to_display
        .patchValue(['All evaluations']);
    } else {
      this.evaluations_to_display.patchValue([]);
    }
    this.rendererHTML();
  }

  toggleEvaluationSelection(evaluation: string) {
    if (this.evaluations_to_display.value && this.evaluations_to_display.value.includes('All evaluations')) {
      const index = this.evaluations_to_display.value.indexOf('All evaluations');
      this.evaluations_to_display.value.splice(index, 1);
      this.evaluations_to_display.patchValue(this.evaluations_to_display.value);
    }
    this.rendererHTML();
  }

  toggleCardSelection(card: string) {
    if (this.cards_to_display.value && this.cards_to_display.value.includes('All cards')) {
      const index = this.cards_to_display.value.indexOf('All cards');
      this.cards_to_display.value.splice(index, 1);
      this.cards_to_display.patchValue(this.cards_to_display.value);
    }
    this.rendererHTML();
  }

  toggleTagSelection(tag: string) {
    if (this.tags_to_display.value && this.tags_to_display.value.includes('All tags')) {
      const index = this.tags_to_display.value.indexOf('All tags');
      this.tags_to_display.value.splice(index, 1);
      this.tags_to_display.patchValue(this.tags_to_display.value);
    }
    this.rendererHTML();
  }


  showOptions() {
    if (this.card) {
      switch (this.card.kind) {
        case 'localstorage':
        case 'cookie':
        case 'beacons':
          this.evaluation_options = ['No evaluation', 'Compliant', 'Not compliant', 'To be defined', 'Global Evaluation', 'Comments'];
          break
        default:
          this.evaluation_options = ['Global Evaluation', 'Comments'];
      }
    }

    if (this.tag) {
      this.tagService.getAllCards(this.tag)
        .then(cards => {
          this.cards_options = cards.map(card => card.name);
        })
    }

    if (this.analysis) {
      this.analysisService.getAllTags(this.analysis)
        .then(tags => {
          this.tags_options = tags.map(tag => tag.name);

          const cards_promises = tags.map(tag => this.tagService.getAllCards(tag));
          Promise.all(cards_promises)
            .then(cards => {
              this.cards_options = Array.from(new Set(cards.flat().map(card => card.name)));
            })
        })
    }
  }

  getAnalysis(): Promise<Tag | void> {
    return new Promise((resolve, reject) => {
      const analyse_id = parseInt(this.route.snapshot.params['id']);
      if (!isNaN(analyse_id)) {
        this.analysisService
          .find(analyse_id)
          .then((analysis: Analysis) => {
            this.analysis = analysis;
          });
      }
      resolve();
    });
  }

  getTag(): Promise<Tag | void> {
    return new Promise((resolve, reject) => {
      const tag_id = parseInt(this.route.snapshot.params['tag_id']);
      if (!isNaN(tag_id)) {
        this.tagService
          .find(tag_id)
          .then((tag: Tag) => {
            this.tag = tag;
          });
      }
      resolve();
    });
  }

  getCard(): Promise<Card | void> {
    return new Promise((resolve, reject) => {
      const card_id = parseInt(this.route.snapshot.params['card_id']);
      if (!isNaN(card_id)) {
        this.cardService
          .find(card_id)
          .then((card: Card) => {
            this.card = card;
            resolve(card);
          });
      }
      resolve();
    });
  }

  async rendererHTML() {
    let json = null;

    if (this.card) {
      json = await this.reportService.fromCard(this.card, this.evaluations_to_display.value)
      json['tag'] = this.tag;
    } else if (this.tag) {
      json = await this.reportService.fromTag(this.tag, this.cards_to_display.value, this.evaluations_to_display.value);
    } else if (this.analysis) {
      json = await this.reportService.fromAnalysis(this.analysis, this.tags_to_display.value, this.cards_to_display.value, this.evaluations_to_display.value);
    } else {
      throw new Error("Don't know what to report")
    }

    this.json = json;
    if (this.selected_template) {
      this.browserService.renderPug(window, this.selected_template.pug, this.json)
        .then(html => {
          this.pug = html;
        });
    }
  }

  start_edition(): void {
    this.editing = true;
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      content_css: 'tinymce/skins/content/default/content.css',
      plugins: 'lists',
      autoresize_bottom_margin: 30,
      auto_focus: true,
      autoresize_min_height: 40,
      width: 1200,
      height: 600,
      selector: '#report_editor',
      toolbar:
        'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin: false,
      setup: (editor: any) => {
        this.reportEditor = editor;
      }
    });
  }

  close_edition(): void {
    this.editing = false;
    this.pug = this.reportEditor.getContent();
    tinymce.remove(this.reportEditor);
  }

  export(format: 'json' | 'html' | 'pdf' | 'docx' | 'xlsx'): void {
    function export_result(url: any, name: string) {
      const a = document.getElementById('base-exportBlock');

      if (a) {
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          name
        );
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      }
    }

    const date = new Date().getTime();

    const data = this.pug;
    switch (format) {
      case 'json':
        const json =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(this.json));

        export_result(json, date + '_export.json');
        break;

      case 'xlsx':
        if (this.card) {
          const blob = this.reportService.toXLXS(this.json);
          var xlxsUrl = URL.createObjectURL(blob);
          export_result(xlxsUrl, date + '_' + this.card.name + '.xlsx');
        } else if (this.tag) {
          const blob = this.reportService.toXLXS(this.json);
          var xlxsUrl = URL.createObjectURL(blob);
          export_result(xlxsUrl, date + '' + this.tag.name + '.xlsx');
        } else {
          for (let taginfo of this.json.tags) {
            const tag = taginfo["tag"];
            const blob = this.reportService.toXLXS(taginfo);
            var xlxsUrl = URL.createObjectURL(blob);
            export_result(xlxsUrl, date + '_' + tag.name + '.xlsx');
          }
        }
        break;
      case 'html':
        const url =
          'data:text/html;charset=utf-8,' +
          encodeURIComponent(data);
        export_result(url, date + '_export.html');
        break;
      case 'pdf':
        this.browserService.export(window, format, data)
          .then((pdf: any) => {
            var blobUrl = URL.createObjectURL(new Blob([pdf]));
            export_result(blobUrl, date + '_export.pdf');
          })
        break;

      case 'docx':
        this.browserService.export(window, format, data)
          .then((docx: any) => {
            var blobUrl = URL.createObjectURL(new Blob([docx]));
            export_result(blobUrl, date + '.docx');
          })
        break;
    }
  }
}
