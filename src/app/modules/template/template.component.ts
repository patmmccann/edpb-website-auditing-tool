import { Component, OnInit, NgModule, Input, ViewChild, ComponentRef, ViewContainerRef,
  
  ModuleWithComponentFactories,
  ElementRef, Compiler, Sanitizer, ComponentFactoryResolver, ViewEncapsulation } from '@angular/core';
import { TemplateService } from 'src/app/services/template.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BrowserService } from 'src/app/services/browser.service';
//import { render } from 'pug';

export interface AdComponent {
  data: any;
}



@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})


export class TemplateComponent implements OnInit {
  private componentRef: ComponentRef<unknown> | null = null;
  @ViewChild("container", { read: ViewContainerRef, static: true  })
  container: ViewContainerRef | null = null;

  @Input()
  type: string ="";
  
  context: any =null;

  constructor(
  private templateService:TemplateService,
  private route: ActivatedRoute,
  private browserService:BrowserService,
  private sanitizer: DomSanitizer
  ) { }

    pug:string = "";

  ngOnInit(): void {

    container: ViewContainerRef;
    
    const sectionId = parseInt(this.route.snapshot.params['id'], 10);

    this.templateService
    .get(sectionId)
    .then((template)=>{
      this.browserService.renderPug(window, template.pug, {})
      .then((html_dump)=>{
        this.pug = html_dump;
      })
    });

  }

}

