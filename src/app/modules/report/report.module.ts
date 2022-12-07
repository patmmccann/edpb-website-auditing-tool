import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';
import { MaterialAllModule } from 'src/app/material.module';
import { ReportRendererComponent } from './report-renderer/report-renderer.component';


@NgModule({
  declarations: [
    ReportComponent,
    ReportRendererComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportRoutingModule,
    MaterialAllModule
  ]
})
export class ReportModule { }
