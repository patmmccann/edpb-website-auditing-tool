import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Analysis } from './models/analysis.model';
import { EvaluationService } from './services/evaluation.service';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value:string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: 'safeIMG' })
export class SafeImgPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(blob:Blob) {
    let objectURL = URL.createObjectURL(blob);
    return this.sanitized.bypassSecurityTrustUrl(objectURL);
  }
}

@Pipe({ name: 'safeURL' })
export class SafeUrl implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  isURL(input: string): boolean {
    const pattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;

    if (pattern.test(input)) {
      return true;
    }
    return pattern.test(`http://${input}`);
  };

  transform(value:string) {
    if (this.isURL(value)) {
      return value.indexOf('://') === -1 ? `http://${value}` : value;
    }
    return value;
  }
}

@Pipe({ name: 'filterForUser' })
export class FilterForUser implements PipeTransform {
  transform(items: any[], 
    searchText: string): any[] {
      if (!items || !searchText) return items;
      searchText = searchText.toLowerCase();
          return items.filter((data) => this.matchValue(data,searchText));
  }
  matchValue(data:{ [key: string]: string; }, value:string) {
    return Object.keys(data).map((key) => {
      const allowedFields = ['name', 'category', 'author_name', 'evaluator_name', 'validator_name', 'structure_name', 'structure_sector_name', 'sector_name']
      if (allowedFields.includes(key)) {
        value = value.replace(/[{()}]/g, '');
        return new RegExp(value, 'gi').test(data[key]);
      } else {
        return false;
      }
    }).some(result => result);
  }
}



@Pipe({ name: 'filterForEval' })
export class FilterForEval implements PipeTransform {
  constructor(
    private evaluationService : EvaluationService
  ){
  }

  async transform(items: Analysis[], 
    not_evaluate : boolean,
    compliant:boolean, 
    not_compliant:boolean,
    tbd:boolean): Promise<Analysis[]> {
      if (!not_evaluate && !compliant && !not_compliant && !tbd) return items;
      const res = [];
      for (let item of items){
        if (item.evaluation == null){
          if (not_evaluate) res.push(item)
        }else{
          const evaluation = await this.evaluationService.find(item.evaluation)
          if (evaluation){
            if ((compliant && evaluation.status == 'compliant') ||
                (not_compliant && evaluation.status == 'not_compliant') ||
                (tbd && evaluation.status == 'TBD')){
                  res.push(item);
                }
          }
        }
      }
      return res;
  }
  
}

import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { CookieKnowledgesService } from 'src/app/services/knowledges/cookie-knowledges.service';
import { LocalstorageKnowledgesService } from './services/knowledges/localstorage-knowledges.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgesService } from './services/knowledges.service';

@Pipe({ name: 'findInKnowlegeBase' })
export class FindPurpose implements PipeTransform {
    constructor(
        private cookieKnowledgesService: CookieKnowledgesService,
        private localstorageKnowledgeService: LocalstorageKnowledgesService
    ) {

    }

    async transform(line: CookieLine | LocalStorageLine): Promise<string> {
        if (line.kind == 'cookie'){
            const cookieLine = line as CookieLine
            const purposes = new Set();
            const result= await this.cookieKnowledgesService.getCookieEntries(cookieLine.domain, cookieLine.name);
            if(result.name_and_domain.length > 0){
                result.name_and_domain.forEach(el => purposes.add(el.category));
              }else if (result.name.length > 0){
                result.name.forEach(el => purposes.add(el.category));
            }
            return Array.from(purposes).join(",");
        } else if(line.kind == 'localstorage'){
          const localstorageline = line as LocalStorageLine
          const result= await this.localstorageKnowledgeService.getLocalStorageEntries(localstorageline.key, localstorageline.log);
          const purposes = new Set(result.map((x:any)=> x.category));          
          return Array.from(purposes).join(",");
      }
        return "";
    }
}


@Pipe({ name: 'nbEntriesInKnowlegeBase' })
export class NbEntriesInKnowledge implements PipeTransform {
    constructor(
        private localstorageKnowledgesService: LocalstorageKnowledgesService,
        private cookieKnowledgesService: CookieKnowledgesService,
    ) {

    }

    async transform(base: KnowledgeBase): Promise<number> {
      if (base.category == 'cookie'){
        const entries = await this.cookieKnowledgesService
        .getEntries(base.id);
        return entries.length;
      }else if (base.category == 'localstorage'){
        const entries = await this.localstorageKnowledgesService
        .getEntries(base.id);
        return entries.length;
      }
      return 0;
    }
}
