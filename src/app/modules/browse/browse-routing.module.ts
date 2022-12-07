import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowseComponent } from './browse.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: 'browse',
        component: BrowseComponent
      },
      {
        path: 'browse/:id/tag/:tag_id',
        component: BrowseComponent
      }
    ])
  ]
})
export class BrowseRoutingModule { }
