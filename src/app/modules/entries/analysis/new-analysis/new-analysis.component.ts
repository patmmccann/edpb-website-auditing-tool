/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AnalysisAndTag, AnalysisService } from 'src/app/services/analysis.service';
import { Analysis } from 'src/app/models/analysis.model';
import { BrowserService } from 'src/app/services/browser.service';
import { InspectionService } from 'src/app/services/inspection.service';
import { Tag } from 'src/app/models/tag.model';
import { Card } from 'src/app/models/card.model';
import { WebsiteCard } from 'src/app/models/cards/website-card.model'
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { SettingsService } from 'src/app/services/settings.service';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-new-analysis',
  templateUrl: './new-analysis.component.html',
  styleUrls: ['./new-analysis.component.scss']
})
export class NewAnalysisComponent implements OnInit {
  @ViewChild('entry') selectEntry: ElementRef = new ElementRef({});

  public analysis: Analysis | null = null;
  public cards: Card[] = [];
  public tagForm: boolean = true;
  public sweepForm: boolean = false;
  public contactForm: boolean = false;
  public auditorForm: boolean = false;
  public identificationForm: boolean = false;
  public documentsForm: boolean = false;

  public typeEntry: string = 'browser';
  public url_correct: string = "";
  public wecOK: boolean = false;
  public wecError: boolean = false;
  public harOK: boolean = false;
  public harError: boolean = false;
  public urlOK = false;
  public urlError = false;
  public  addUrlOnBlur = true;

  public sweep_urls : string[] = [];

  public firstTag: Tag = new Tag("");
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  sources: string[][] = [["browser", "Internal Browser"], ["har", "HTTP Archive format (HAR)"], ["wec", "Website Evidence Collector (WEC)"]];
  default_source: string = 'har';

  analysisForm: FormGroup = new FormGroup({});

  constructor(private analysisService: AnalysisService,
    private el: ElementRef,
    private inspectionService: InspectionService,
    private router: Router,
    private route: ActivatedRoute,
    private browserService: BrowserService,
    public settingService : SettingsService,
    private cardService : CardService
  ) {
    const analysisId = parseInt(this.route.snapshot.params['id'], 10);
    if (analysisId) {
      this.analysisService
        .find(analysisId)
        .then((analysis: Analysis) => {
          this.analysis = analysis;
          this.urlOK = true;
          this.analysisForm.controls['name']
            .setValue(analysis.name);
          this.analysisForm.controls['name']
            .disable();
          this.analysisForm.controls['url']
            .setValue(analysis.url);
          this.analysisForm.controls['url']
            .disable();
        })
        .catch((err: Error) => {
          console.error(err);
        });
    }
  }

  ngOnInit(): void {
    this.analysisForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(1)]
      ),
      url: new FormControl(
        null, [
        Validators.required,
        Validators.minLength(1)]
      ),
      tag: new FormControl(
        null, [
        Validators.required,
        Validators.minLength(1)]
      ),
      source: new FormControl(),
      sweep_operation: new FormControl(),
      sweep_list: new FormControl(),
      contact_name: new FormControl(),
      contact_mail: new FormControl(),
      contact_phone: new FormControl(),
      auditor_name: new FormControl(),
      auditor_mail: new FormControl(),
      auditor_phone: new FormControl(),
      id_tag: new FormControl()
    });

    this.analysisForm.controls['source'].setValue(this.default_source, { onlySelf: true });
  }

  updateForm() : void{
    if (this.tagForm){
      this.analysisForm.controls['url'].setValidators([
        Validators.required,
        Validators.minLength(1)]);
      this.analysisForm.controls['tag'].setValidators([
        Validators.required,
        Validators.minLength(1)]);
      this.analysisForm.controls['sweep_operation'].clearValidators();
      this.analysisForm.controls['sweep_list'].clearValidators();
      this.analysisForm.controls['sweep_list'].updateValueAndValidity();
      this.analysisForm.controls['sweep_operation'].updateValueAndValidity();
      this.analysisForm.controls['url'].updateValueAndValidity();
      this.analysisForm.controls['tag'].updateValueAndValidity();
    }else if (this.sweepForm){
      this.analysisForm.controls['sweep_operation'].setValidators([
        Validators.required,
        Validators.minLength(1)]);
        this.analysisForm.controls['sweep_list'].setValidators([
          Validators.requiredTrue]);
      this.analysisForm.controls['url'].clearValidators();
      this.analysisForm.controls['tag'].clearValidators();
      this.analysisForm.controls['sweep_operation'].updateValueAndValidity();
      this.analysisForm.controls['sweep_list'].updateValueAndValidity();
      this.analysisForm.controls['url'].updateValueAndValidity();
      this.analysisForm.controls['tag'].updateValueAndValidity();
      this.contactForm = false;
      this.auditorForm = false;
      this.identificationForm = false;
      this.documentsForm = false;
    }

  }

  checkURL(value: string) {
    function isURL(input: string): boolean {
      const pattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;
  
      if (pattern.test(input)) {
        return true;
      }
      return pattern.test(`http://${input}`);
    };

    if (isURL(value)) {
      this.url_correct = value.indexOf('://') === -1 ? `http://${value}` : value;

      this.urlOK = true;
      this.urlError = false;

    }else{
      this.urlOK = false;
      this.urlError = true;
      this.analysisForm.controls['tag'].setValue("");
    }
  }

  onSubmit(): void {
    if (this.tagForm){
      if (this.typeEntry == "browser") {
        this.cards = this.cardService.initCardsBasedOnSetting();
      }
      this.firstTag.name = this.analysisForm.controls['tag'].value;
      this.firstTag.source = this.analysisForm.controls['source'].value;
      let submit = this.analysis ?
        this.analysisService
          .addTag({ ...this.analysis }, { ...this.firstTag }, [...this.cards]) :
        this.analysisService
          .saveNewAnalysis({ ...this.analysisForm.value }, { ...this.firstTag }, [...this.cards]);
  
      submit.then((result: AnalysisAndTag) => {
        if (this.typeEntry == "browser") {
          this.browserService
            .newSession(window, result.analysis, result.tag)
            .then(session => {
              this.router.navigate(session);
            });
        } else {
          this.router.navigate(['analysis', result.analysis.id, 'tag', result.tag.id]);
        }
      });
    }else{

    }
  }

  importHar(event?: any): void {
    if (event) {
      const reader = new FileReader();
      reader.readAsText(event.target.files[0], 'UTF-8');

      reader.onload = (event2: any) => {
        const har = JSON.parse(event2.target.result);
        this.browserService.parseHar(window, har)
        .then((cards: Card[]) => {
          this.firstTag.source = "har";
          this.cards = cards;
          this.harOK = true;
          this.harError = false;
        })
        .catch(err => {
          this.harError = true;
          this.harOK = false;
          this.analysisForm.controls['tag'].setValue("");
          console.log(err);
        });
      };

      this.inspectionService.importHarFile(event.target.files[0]);
    } else {
      this.el.nativeElement.querySelector('#import_file').click();
    }
  }

  importWec(event?: any): void {
    if (event) {
      this.inspectionService.importWecFiles(event.target.files)
        .then((cards: Card[]) => {
          this.firstTag.source = "wec";
          this.cards = cards;
          const websiteCard = <WebsiteCard>cards.filter(card => card.kind == 'info')[0];
          const url_corrected = websiteCard.url.indexOf('://') === -1 ? `http://${websiteCard.url}` : websiteCard.url;
          this.analysisForm.controls['url'].setValue(url_corrected);
          this.wecOK = true;
          this.wecError = false;
        })
        .catch(err => {
          this.wecError = true;
          this.wecOK = false;
          this.analysisForm.controls['tag'].setValue("");
          console.log(err);
        });
    } else {
      this.el.nativeElement.querySelector('#import_folder').click();
    }
  }

  imporSweepList(event?: any): void {
    if (event) {
      this.inspectionService.importUrls(event.target.files[0])
        .then((urls: string[]) => {
          for (let url of urls){
            this.sweep_urls.push(url);
            this.analysisForm.controls['sweep_list'].setValue(true);
          }
        });
    } else {
      this.el.nativeElement.querySelector('#import_sweep_list').click();
    }
  }

  setSweep(value: string): void {
    this.analysisForm.controls['sweep_operation'].setValue(value);
  }


  addUrl(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.sweep_urls.push(value);
      this.analysisForm.controls['sweep_list'].setValue(true);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeUrl(url: string): void {
    const index = this.sweep_urls.indexOf(url);

    if (index >= 0) {
      this.sweep_urls.splice(index, 1);
      if (this.sweep_urls.length == 0) this.analysisForm.controls['sweep_list'].setValue(false);
    }
  }
}
