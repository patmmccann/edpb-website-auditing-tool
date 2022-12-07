import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OthersRoutingModule } from './others-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './home/home.component';
import { MaterialAllModule } from 'src/app/material.module';

@NgModule({
  declarations: [
    HomeComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    OthersRoutingModule,
    MaterialAllModule
  ]
})
export class OthersModule { }
