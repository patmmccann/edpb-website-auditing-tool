/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef, EventEmitter, OnInit, ViewChild, Output, Input, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Analysis } from 'src/app/models/analysis.model';
import { Tag } from 'src/app/models/tag.model';
import { AnalysisService } from 'src/app/services/analysis.service';
import { BrowserService } from 'src/app/services/browser.service';
import { CookieCard } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageCard } from 'src/app/models/cards/local-storage-card.model';
import { TagService } from 'src/app/services/tag.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnDestroy , OnChanges{
  @ViewChild('search') searchElement: ElementRef = new ElementRef({});
  @ViewChild('camera') cameraElement: ElementRef = new ElementRef({});
  addressbarValue: string = "";
  canGoBackward: boolean = false;
  canGoForward: boolean = false;
  
  
  @Output() save = new EventEmitter();
  @Output() erase = new EventEmitter();
  @Output() screenshot = new EventEmitter();
  @Output() play = new EventEmitter();
  @Output() pause = new EventEmitter();
  @Output() toggleLog = new EventEmitter();
  @Output() devTool = new EventEmitter();
  
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
  @Input() _zoomFactor = 100;
  
  pause_state:boolean = false;
  log_opened:boolean =true;
  cookieCard: CookieCard | null = null;
  localStorageCard: LocalStorageCard | null = null;
  loading :boolean = false;
  logVisibile:boolean = true;

  constructor(
    private browserService:BrowserService,
    public settingsService:SettingsService
  ) { 


  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.browserService
    .getURL(window, this.analysis, this.tag)
    .then((url:string)=>{
      this.addressbarValue = url;
    });

    this.browserService.getZoomFactor(window, this.analysis, this.tag).then((zoomFactor:number) =>{
      this._zoomFactor = zoomFactor * 100;
    });
  }

  ngOnDestroy(): void {
  }


  isURL(input: string): boolean {
    const pattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;

    if (pattern.test(input)) {
      return true;
    }
    return pattern.test(`http://${input}`);
  };

  update():void{
    this.browserService
    .getURL(window, this.analysis, this.tag)
    .then((url:string)=>{
      this.addressbarValue = url;
    });

    this.browserService
    .canGoBackward(window, this.analysis, this.tag)
    .then((canGoBackward:boolean)=>{
      this.canGoBackward = canGoBackward;
    });

    this.browserService
    .canGoForward(window, this.analysis, this.tag)
    .then((canGoForward:boolean)=>{
      this.canGoForward = canGoForward;
    });
  }

  goToPage(url: string): void {
    let value = url;

    if (this.isURL(value)) {
      url = value.indexOf('://') === -1 ? `http://${value}` : value;
    }

    this.loadUrl(url);
  }

  async loadUrl(url:string):Promise<void>{
    if (this.loading){
      await this.browserService
      .stop(window, this.analysis, this.tag);
    }

    this.loading = true;
    this.addressbarValue = await this.browserService
    .gotoURL(window, this.analysis, this.tag, url);
    this.loading = false;
  }

  refresh():void{
    this.browserService.refresh(window, this.analysis, this.tag);
  }

  backward():void{
    this.browserService.backward(window, this.analysis, this.tag);
  }

  forward():void{
    this.browserService.forward(window, this.analysis, this.tag);
  }

  onKeyDownEvent(e: any) {
    if (e.key === 'Escape') {
      this.addressbarValue = "";
    }

    if (e.key === 'Escape') {
      const target = e.currentTarget;
      requestAnimationFrame(() => {
        target.select();
      });
    }

    if (e.key === 'Enter') {
      e.currentTarget.blur();
      const { value } = e.currentTarget;
      this.goToPage(value);
    }
  }


  onMouseDown(e: any) {
    this.searchElement.nativeElement.select();
  };

  set zoomFactor(factor : number){
    this._zoomFactor = factor;
    this.browserService.setZoomFactor(window, this.analysis, this.tag, factor/100);
  }

  get zoomFactor(){
    return this._zoomFactor;
  }

}
