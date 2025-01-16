/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';
import { MaterialAllModule } from 'src/app/material.module';
import { ReportRendererComponent } from './report-renderer/report-renderer.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { DocxComponent } from './toolbar/docx/docx.component';
import { PdfComponent } from './toolbar/pdf/pdf.component';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ReportRoutingModule,
        MaterialAllModule,
        ReportComponent,
        ReportRendererComponent,
        ToolbarComponent,
        DocxComponent,
        PdfComponent
    ]
})
export class ReportModule { }
