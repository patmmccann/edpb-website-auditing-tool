import { Routes } from "@angular/router";
import { HomeComponent } from "./modules/others/home/home.component";

export const routes: Routes = [{
    path: '',
    component: HomeComponent
},
{
    path: 'entries',
    loadChildren: () => import('./modules/entries/entries-routes').then((m) => m.entriesRoutes),
},
{
    path: 'knowledge_bases',
    loadChildren: () => import('./modules/base/base-routes').then((m) => m.baseRoutes),
},
{
    path: 'template',
    loadChildren: () => import('./modules/template/template-routes').then((m) => m.templateRoutes),
},
{
    path: 'settings',
    loadChildren: () => import('./modules/others/settings-routes').then((m) => m.settingsRoutes),
},
{
    path: 'helps',
    loadChildren: () => import('./modules/others/helps-routes').then((m) => m.helpsRoutes),
},
{
    path: 'browse',
    loadChildren: () => import('./modules/browse/browse-routes').then((m) => m.browseRoutes),
},
{
    path: 'analysis',
    loadChildren: () => import('./modules/analysis/analysis-routes').then((m) => m.analysisRoutes),
},
{
    path: 'report',
    loadChildren: () => import('./modules/report/report-routes').then((m) => m.reportRoutes),
}
];
