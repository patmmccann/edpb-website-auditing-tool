import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnalysisComponent } from './analysis.component';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: 'analysis/:id',
        component: AnalysisComponent
      },
      {
        path: 'analysis/:id/tag/:tag_id',
        component: AnalysisComponent
      }
    ])
  ],

  exports: [RouterModule]
})
export class AnalysisRoutingModule { }
