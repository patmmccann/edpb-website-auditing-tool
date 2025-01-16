/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BaseRoutingModule } from './base-routing.module';
import { MaterialAllModule } from 'src/app/material.module';
import { CompareComponent } from './compare/compare.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        BaseRoutingModule,
        MaterialAllModule,
        BaseComponent,
        CompareComponent
    ]
})
export class BaseModule { }
