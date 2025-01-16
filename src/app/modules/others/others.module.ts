/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OthersRoutingModule } from './others-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './home/home.component';
import { MaterialAllModule } from 'src/app/material.module';
import { AnalysisComponent } from './settings/analysis/analysis.component';
import { BrowserComponent } from './settings/browser/browser.component';
import { GeneralComponent } from './settings/general/general.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        OthersRoutingModule,
        MaterialAllModule,
        HomeComponent,
        SettingsComponent,
        AnalysisComponent,
        BrowserComponent,
        GeneralComponent
    ]
})
export class OthersModule { }
