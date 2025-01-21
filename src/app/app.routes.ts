import { Routes } from "@angular/router";
import { HomeComponent } from "./modules/others/home/home.component";

export const routes: Routes = [{
    path: '',
    component: HomeComponent
},
{
    path: 'entries',
    loadChildren: () => import('./modules/entries/entries-routing').then((m) => m.entriesRoutes),
},
{
    path: 'knowledge_bases',
    loadChildren: () => import('./modules/base/base-routing').then((m) => m.baseRoutes),
},
{
    path: 'template',
    loadChildren: () => import('./modules/template/template-routing').then((m) => m.templateRoutes),
},
{
    path: 'settings',
    loadChildren: () => import('./modules/others/settings-routing').then((m) => m.settingsRoutes),
},
{
    path: 'helps',
    loadChildren: () => import('./modules/others/helps-routing').then((m) => m.helpsRoutes),
},
{
    path: 'browse',
    loadChildren: () => import('./modules/browse/browse-routing').then((m) => m.browseRoutes),
},
{
    path: 'analysis',
    loadChildren: () => import('./modules/analysis/analysis-routing').then((m) => m.analysisRoutes),
},
{
    path: 'report',
    loadChildren: () => import('./modules/report/report-routing').then((m) => m.reportRoutes),
}
];
