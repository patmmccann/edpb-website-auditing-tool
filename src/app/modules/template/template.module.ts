/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialAllModule } from 'src/app/material.module';
import { TemplateComponent } from './template.component';
import { TemplateRoutingModule } from './template-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TemplateRoutingModule,
        MaterialAllModule,
        TemplateComponent
    ]
})
export class TemplateModule { }
