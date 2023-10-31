import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule } from '@angular/router';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { ModalComponent } from './components/modal/modal.component';


import {
  FilterForUser, SafeHtmlPipe, SafeImgPipe, SafeUrl, FilterForEval, FindPurpose, NbEntriesInKnowledge
} from '../pipes/tools';


import { KnowledgeBaseComponent } from './components/knowledge-base/knowledge-base.component';

import { CookieKnowledgesService } from '../services/knowledges/cookie-knowledges.service';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { KnowledgeBaseItemComponent } from './components/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import{KnowledgeCookieItemComponent} from './components/knowledge-base/knowledge-cookie-item/knowledge-cookie-item.component';

import { CookieCardComponent } from './components/cards/cookie-card/cookie-card.component';
import { LocalStorageCardComponent } from './components/cards/local-storage-card/local-storage-card.component';
import { ScreenshotCardComponent } from './components/cards/screenshot-card/screenshot-card.component';
import { CookieDetailsComponent } from './components/details/cookie-details/cookie-details.component';
import { CallstackDetailsComponent } from './components/details/callstack-details/callstack-details.component';
import { LocalstorageDetailsComponent } from './components/details/localstorage-details/localstorage-details.component';
import { DetailsComponent } from './components/details/details.component';

import { MaterialAllModule } from 'src/app/material.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { KnowledgeLocalstorageItemComponent } from './components/knowledge-base/knowledge-localstorage-item/knowledge-localstorage-item.component';
import { HttpCardComponent } from './components/cards/http-card/http-card.component';
import { TestsslCardComponent } from './components/cards/testssl-card/testssl-card.component';
import { CardsComponent } from './components/cards/cards.component';
import { EvaluationsComponent } from './components/evaluations/evaluations.component';
import { CommentsComponent } from './components/comments/comments.component';
import { CommentItemComponent } from './components/comments/comment-item/comment-item.component';
import { TrafficCardComponent } from './components/cards/traffic-card/traffic-card.component';
import { UnsafeFormCardComponent } from './components/cards/unsafe-form-card/unsafe-form-card.component';
import { BeaconCardComponent } from './components/cards/beacon-card/beacon-card.component';
import { BeaconDetailsComponent } from './components/details/beacon-details/beacon-details.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { LanguagesService } from '../services/languages.service';

@NgModule({
  declarations: [
    SideNavComponent,
    FilterForUser,
    FilterForEval,
    ModalComponent,
    KnowledgeBaseComponent,
    SafeHtmlPipe,
    SafeImgPipe,
    FindPurpose,
    NbEntriesInKnowledge,
    SafeUrl,
    KnowledgeBaseItemComponent,
    KnowledgeCookieItemComponent,
    CookieCardComponent,
    TestsslCardComponent,
    HttpCardComponent,
    LocalStorageCardComponent,
    ScreenshotCardComponent,
    CookieDetailsComponent,
    CallstackDetailsComponent,
    LocalstorageDetailsComponent,
    DetailsComponent,
    KnowledgeLocalstorageItemComponent,
    HttpCardComponent,
    TestsslCardComponent,
    CardsComponent,
    EvaluationsComponent,
    CommentsComponent,
    CommentItemComponent,
    TrafficCardComponent,
    UnsafeFormCardComponent,
    BeaconCardComponent,
    BeaconDetailsComponent,
    LoadingOverlayComponent
    ],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    MaterialAllModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [
    SideNavComponent,
    FilterForUser,
    FilterForEval,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    KnowledgeBaseComponent,
    SafeHtmlPipe,
    SafeImgPipe,
    SafeUrl,
    FindPurpose,
    NbEntriesInKnowledge,
    CookieCardComponent,
    TestsslCardComponent,
    HttpCardComponent,
    LocalStorageCardComponent,
    ScreenshotCardComponent,
    CookieDetailsComponent,
    DetailsComponent,
    MatToolbarModule,
    MatIconModule,
    CallstackDetailsComponent,
    KnowledgeCookieItemComponent,
    MatTreeModule,
    MatTableModule,
    LocalstorageDetailsComponent,
    MatChipsModule,
    CardsComponent,
    EvaluationsComponent,
    CommentsComponent,
    LoadingOverlayComponent,
    TranslateModule,
  ],
  providers: [
    KnowledgeBaseService,
    CookieKnowledgesService
  ]
})
export class SharedModule {  static forRoot(): ModuleWithProviders<SharedModule> {
  return {
    ngModule: SharedModule
  };
} }
