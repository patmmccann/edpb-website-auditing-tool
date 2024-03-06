import { Pipe, PipeTransform } from '@angular/core';
import { Analysis } from '../models/analysis.model';
import { EvaluationService } from '../services/evaluation.service';
import { Details } from '../models/details.model';
import { Status } from '../models/evaluation.model';
import { CookieLine } from '../models/cards/cookie-card.model';
import { LocalStorageLine } from '../models/cards/local-storage-card.model';
import { BeaconLine } from '../models/cards/beacon-card.model';
import { CookieKnowledgesService, CookieSearch } from '../services/knowledges/cookie-knowledges.service';
import { LocalstorageKnowledgesService } from '../services/knowledges/localstorage-knowledges.service';
import { LocalStorageKnowledge } from '../models/knowledges/localstorage-knowledge.model';

@Pipe({ name: 'filterForUser' })
export class FilterForUser implements PipeTransform {
  transform(items: any[],
    searchText: string): any[] {
    if (!items || !searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter((data) => this.matchValue(data, searchText));
  }
  matchValue(data: { [key: string]: string; }, value: string) {
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
    private evaluationService: EvaluationService
  ) {
  }

  async transform(items: Analysis[],
    not_evaluate: boolean,
    compliant: boolean,
    not_compliant: boolean,
    tbd: boolean): Promise<Analysis[]> {
    if (!not_evaluate && !compliant && !not_compliant && !tbd) return items;
    const res = [];
    for (let item of items) {
      if (item.evaluation == null) {
        if (not_evaluate) res.push(item)
      } else {
        const evaluation = await this.evaluationService.find(item.evaluation)
        if (evaluation) {
          if ((compliant && evaluation.status == 'compliant') ||
            (not_compliant && evaluation.status == 'not_compliant') ||
            (tbd && evaluation.status == 'TBD')) {
            res.push(item);
          }
        }
      }
    }
    return res;
  }

}

@Pipe({ name: 'filterForStatus' })
export class FilterForStatus implements PipeTransform {

  transform(items: Details[],
    status: Status[]): any {
    if (status.length == 0) return items;

    return items.filter(item => this.matchValue(item, status))
  }

  matchValue(item: Details, status: Status[]) {
    return (status.includes('compliant') && item.status == 'compliant') ||
      (status.includes('not_compliant') && item.status == 'not_compliant') ||
      (status.includes('TBD') && item.status == 'TBD') ||
      (status.includes('pending') && item.status == 'pending') ? true : false;
  }
}

@Pipe({ name: 'filterForCookie' })
export class FilterForCookie implements PipeTransform {
  transform(items: CookieLine[],
    cookie: any): any {
    if (Object.keys(cookie).length == 0 ||
      (cookie.searchDomain == '' && cookie.searchName == ''))
      return items;

      return items.filter(item => this.matchDomain(item, cookie) && this.matchName(item, cookie))
  }

  matchDomain(item: CookieLine, cookie: any) {
    if (!cookie.searchDomain || cookie.searchDomain == '' || item.domain.includes(cookie.searchDomain)) return true;
    return false;
  }

  matchName(item: CookieLine, cookie: any) {
    if (!cookie.searchName || cookie.searchName == '' || item.name.includes(cookie.searchName)) return true;
    return false;
  }
}


@Pipe({ name: 'filterForLocalStorage' })
export class FilterForLocalStorage implements PipeTransform {
  transform(items: LocalStorageLine[],
    localstorage: any): any {
    if (Object.keys(localstorage).length == 0 ||
      (localstorage.searchHost == '' && localstorage.searchKey == ''))
      return items;

      return items.filter(item => this.matchHost(item, localstorage) && this.matchKey(item, localstorage))
  }

  matchHost(item: LocalStorageLine, localstorage: any) {
    if (!localstorage.searchHost || localstorage.searchHost == '' || item.host.includes(localstorage.searchHost)) return true;
    return false;
  }

  matchKey(item: LocalStorageLine, localstorage: any) {
    if (!localstorage.searchKey || localstorage.searchKey == '' || item.key.includes(localstorage.searchKey)) return true;
    return false;
  }
}

@Pipe({ name: 'filterForBeacon' })
export class FilterForBeacon implements PipeTransform {
  transform(items: BeaconLine[],
    beacon: any): any {
    if (Object.keys(beacon).length == 0 ||
      (beacon.searchUrl == ''))
      return items;

      return items.filter(item => this.matchURL(item, beacon))
  }

  matchURL(item: BeaconLine, beacon: any) {
    if (!beacon.searchUrl || beacon.searchUrl == '' || item.url.includes(beacon.searchUrl)) return true;
    return false;
  }
}

@Pipe({ name: 'filterForCookieKnowledgeBase' })
export class FilterForCookieKnowledge implements PipeTransform {
  constructor(
    private cookieKnowledgesService: CookieKnowledgesService
  ) {
  }

  async transform(items: CookieLine[],
    knowledgeBasesAndCategories: any): Promise<CookieLine[]> {
    if ((!knowledgeBasesAndCategories.searchKnowledge || knowledgeBasesAndCategories.searchKnowledge.length == 0) && 
    (!knowledgeBasesAndCategories.searchCategory || knowledgeBasesAndCategories.searchCategory.length ==0))
      return items;

      const search = items.map(cookieLine => this.cookieKnowledgesService.getCookieEntries(cookieLine.domain, cookieLine.name));
      const results = await Promise.all(search);

      return items.filter((item, idx) => this.matchKnowledgeBasesAndCategories(results[idx], knowledgeBasesAndCategories));
  }

  matchKnowledgeBasesAndCategories(search: CookieSearch, knowledgeBasesAndCategories: any) {
    if (!search.matched) return false;

    const searchKnowledgeBase = (knowledgeBasesAndCategories.searchKnowledge && knowledgeBasesAndCategories.searchKnowledge.length > 0);
    const searchCategory = (knowledgeBasesAndCategories.searchCategory && knowledgeBasesAndCategories.searchCategory.length > 0);

    const match_domain = search.domain.filter(item => (searchKnowledgeBase && knowledgeBasesAndCategories.searchKnowledge.includes(item.knowledge_base_id)) || (searchCategory && knowledgeBasesAndCategories.searchCategory.includes(item.category)));
    const match_name = search.name.filter(item => (searchKnowledgeBase && knowledgeBasesAndCategories.searchKnowledge.includes(item.knowledge_base_id)) || (searchCategory && knowledgeBasesAndCategories.searchCategory.includes(item.category)));
    const match_name_and_domain = search.name_and_domain.filter(item => (searchKnowledgeBase && knowledgeBasesAndCategories.searchKnowledge.includes(item.knowledge_base_id)) || (searchCategory && knowledgeBasesAndCategories.searchCategory.includes(item.category)));

    return (match_domain.length>0 || match_name.length >0 || match_name_and_domain.length>0);
  }
}

@Pipe({ name: 'filterForLocalStorageKnowledge' })
export class FilterForLocalStorageKnowledge implements PipeTransform {
  constructor(
    private localstorageKnowledgesService: LocalstorageKnowledgesService
  ) {
  }

  async transform(items: LocalStorageLine[],
    knowledgeBasesAndCategories: any): Promise<LocalStorageLine[]> {
    if ((!knowledgeBasesAndCategories.searchKnowledge || knowledgeBasesAndCategories.searchKnowledge.length == 0) && 
    (!knowledgeBasesAndCategories.searchCategory || knowledgeBasesAndCategories.searchCategory.length ==0))
      return items;

      const search = items.map(localstorageline => this.localstorageKnowledgesService.getLocalStorageEntries(localstorageline.key, localstorageline.log));
      const results = await Promise.all(search);

      return items.filter((item, idx) => this.matchKnowledgeBasesAndCategories(results[idx], knowledgeBasesAndCategories));
  }

  matchKnowledgeBasesAndCategories(search: LocalStorageKnowledge[], knowledgeBasesAndCategories: any) {
    if (search.length == 0) return false;

    const searchKnowledgeBase = (knowledgeBasesAndCategories.searchKnowledge && knowledgeBasesAndCategories.searchKnowledge.length > 0);
    const searchCategory = (knowledgeBasesAndCategories.searchCategory && knowledgeBasesAndCategories.searchCategory.length > 0);

    const match = search.filter(item => (searchKnowledgeBase && knowledgeBasesAndCategories.searchKnowledge.includes(item.knowledge_base_id)) || (searchCategory && knowledgeBasesAndCategories.searchCategory.includes(item.category)));
    return match.length>0;
  }
}