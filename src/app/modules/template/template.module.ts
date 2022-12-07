import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialAllModule } from 'src/app/material.module';
import { TemplateComponent } from './template.component';
import { TemplateRoutingModule } from './template-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    TemplateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TemplateRoutingModule,
    MaterialAllModule
  ]
})
export class TemplateModule { }
