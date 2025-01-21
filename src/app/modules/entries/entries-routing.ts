/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route} from '@angular/router';
import { EntriesComponent } from './entries.component';
import { NewAnalysisComponent } from './analysis/new-analysis/new-analysis.component';

export const entriesRoutes: Route[] = [
  {
    path: '',
    component: EntriesComponent
  },
  {
    path: 'new',
    component: NewAnalysisComponent
  },
  {
    path: 'new/:id',
    component: NewAnalysisComponent
  },
  {
    path: 'report',
    component: EntriesComponent
  },
  {
    path: 'knowledge_bases',
    component: EntriesComponent
  },
  {
    path: 'template',
    component: EntriesComponent
  }
]
