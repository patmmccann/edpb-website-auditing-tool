import { Pipe, PipeTransform } from '@angular/core';


import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { CookieKnowledgesService } from 'src/app/services/knowledges/cookie-knowledges.service';
import { LocalstorageKnowledgesService } from '../services/knowledges/localstorage-knowledges.service';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { KnowledgeBase, allTrustLevel } from 'src/app/models/knowledgeBase.model';


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
    const used_bases = bases.filter(x => x.used == true);
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
