import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TemplateComponent } from './template.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'template/:id',
        component: TemplateComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
