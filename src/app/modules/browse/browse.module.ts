import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { BrowseComponent } from './browse.component';
import { BrowseRoutingModule } from './browse-routing.module';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { LogDetailsComponent } from './log-details/log-details.component';
import { MaterialAllModule } from 'src/app/material.module';
import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    BrowseComponent,
    ToolbarComponent,
    LogDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowseRoutingModule,
    RouterModule,
    MaterialAllModule,
    AngularSplitModule
  ]
})
export class BrowseModule { }
