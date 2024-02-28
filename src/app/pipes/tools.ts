/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Analysis } from '../models/analysis.model';
import { EvaluationService } from '../services/evaluation.service';
import { TrustLevel } from 'src/app/models/knowledgeBase.model';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value: string | null) {
    if (value) {
      return this.sanitized.bypassSecurityTrustHtml(value);
    }
    return "";
  }
}

@Pipe({ name: 'safeIMG' })
export class SafeImgPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(blob: Blob) {
    let objectURL = URL.createObjectURL(blob);
    return this.sanitized.bypassSecurityTrustUrl(objectURL);
  }
}

@Pipe({ name: 'safeURL' })
export class SafeUrl implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  isURL(input: string): boolean {
    const pattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;

    if (pattern.test(input)) {
      return true;
    }
    return pattern.test(`http://${input}`);
  };

  transform(value: string) {
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
  constructor(
    private evaluationService: EvaluationService
  ) {
  }

  transform(items: Details[],
    status: Status[]): any {
    if (status.length == 0) return items;
    const res = [];
    for (let item of items) {
      if ((status.includes('compliant') && item.status == 'compliant') ||
        (status.includes('not_compliant') && item.status == 'not_compliant') ||
        (status.includes('TBD') && item.status == 'TBD') ||
        (status.includes('pending') && item.status == 'pending')) {
        res.push(item);
      }
    }
    return res;
  }
}

import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { CookieKnowledgesService } from 'src/app/services/knowledges/cookie-knowledges.service';
import { LocalstorageKnowledgesService } from '../services/knowledges/localstorage-knowledges.service';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { KnowledgeBase, allTrustLevel } from 'src/app/models/knowledgeBase.model';
import { Details } from '../models/details.model';
import { Status } from '../models/evaluation.model';

@Pipe({ name: 'findInKnowlegeBase' })
export class FindPurpose implements PipeTransform {
  constructor(
    private knowledgeBaseService: KnowledgeBaseService,
    private cookieKnowledgesService: CookieKnowledgesService,
    private localstorageKnowledgeService: LocalstorageKnowledgesService
  ) {

  }

  async transform(line: CookieLine | LocalStorageLine): Promise<string> {
    const bases = await this.knowledgeBaseService.getAll();
    const used_bases = bases.filter(x => x.used == "true");
    const sorted_bases = used_bases.sort((a, b) => (allTrustLevel.indexOf(a.trustLevel) > allTrustLevel.indexOf(b.trustLevel)) ? 1 : ((allTrustLevel.indexOf(b.trustLevel) > allTrustLevel.indexOf(a.trustLevel)) ? -1 : 0));
    const color = {
      validated: "#127137",
      reliable: "#1d5da2",
      informative: "#e8500b",
      undefined: "#127137"
    }

    if (line.kind == 'cookie') {
      const cookiebases = sorted_bases.filter(x => x.category == "cookie");
      const cookieLine = line as CookieLine;
      const purposes = new Set();
      const result = await this.cookieKnowledgesService.getCookieEntries(cookieLine.domain, cookieLine.name);
      if (result.name_and_domain.length > 0) {
        result.name_and_domain.forEach(el => {
          const base = cookiebases.find(x => x.id = el.knowledge_base_id);
          if (base) {
            purposes.add("<span style='color:" + color[base.trustLevel] + "'>" + el.category + "</span>");
          }
        });
      } else if (result.name.length > 0) {
        result.name.forEach(el => {
          const base = cookiebases.find(x => x.id = el.knowledge_base_id);
          if (base) {
            purposes.add("<span style='color:" + color[base.trustLevel] + "'>" + el.category + "</span>");
          }
        });
      }
      return Array.from(purposes).join(" ");
    } else if (line.kind == 'localstorage') {
      const localstoragebase = sorted_bases.filter(x => x.category == "localstorage");
      const localstorageline = line as LocalStorageLine;
      const purposes = new Set();
      const result = await this.localstorageKnowledgeService.getLocalStorageEntries(localstorageline.key, localstorageline.log);
      if (result.length > 0) {
        result.forEach((el: any) => {
          const base = localstoragebase.find(x => x.id = el.knowledge_base_id);
          if (base) {
            purposes.add("<span style='color:" + color[base.trustLevel] + "'>" + el.category + "</span>");
          }
        });
      }
      return Array.from(purposes).join(" ");
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
    if (base.category == 'cookie') {
      const entries = await this.cookieKnowledgesService
        .getEntries(base.id);
      return entries.length;
    } else if (base.category == 'localstorage') {
      const entries = await this.localstorageKnowledgesService
        .getEntries(base.id);
      return entries.length;
    }
    return 0;
  }
}
