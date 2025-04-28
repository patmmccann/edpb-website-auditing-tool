/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Injectable } from '@angular/core';
import { TagService } from './tag.service';
import { Tag } from '../models/tag.model';
import { Evaluation, Status } from '../models/evaluation.model';
import { CardService } from './card.service';
import { Analysis } from '../models/analysis.model';
import { AnalysisService } from './analysis.service';
import { Sheet, utils, write } from 'xlsx';
import { Card } from '../models/card.model';
import { CookieCard } from '../models/cards/cookie-card.model';
import { BrowserService } from './browser.service';
import { LocalStorageCard } from '../models/cards/local-storage-card.model';
import { HTTPCard } from '../models/cards/http-card.model';
import { TrafficCard } from '../models/cards/traffic-card.model';
import { UnsafeFormsCard } from '../models/cards/unsafe-forms-card.model';
import { BeaconCard } from '../models/cards/beacon-card.model';
import { TestSSLCard } from '../models/cards/test-sslcard.model';
import { ScreenshotCard } from '../models/cards/screenshot-card.model';
import { SourceCard } from '../models/cards/source-card.model';
import { InfoCard } from '../models/cards/info-card.model';
import { Details } from '../models/details.model';

const exportable_cards = ["cookie", "localstorage"];

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private analysisService: AnalysisService,
    private cardService: CardService,
    private tagService: TagService,
    private browserService: BrowserService
  ) { 
    if (!(window as any).electron) this.createFakeElectron(window);
  }

  createFakeElectron(window: any): void {
    window.electron = {
      print_to_docx: (htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string): Promise<void> => new Promise((resolve, reject) => resolve()),
      print_to_pdf: (htmlString: string): Promise<void> => new Promise((resolve, reject) => resolve()),
    }
  }

  

  getAllCardsWithEvaluations(tag: Tag,
    cards_type?: string[],
    status?: Status
  )
    : Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.tagService.getAllCards(tag, cards_type, status).then(cards => {
        const promises = cards.map(card => this.cardService.getEvaluation(card));

        Promise.all(promises).then(evaluations => {
          resolve(cards.map((card, i) => {
            const res: any = {
              ...card
            };

            res.evaluation = evaluations[i];
            return res;
          }));
        })
      })
    });
  }

  getTagWithEvaluations(tag: Tag,
    cards_type?: string[],
    status?: Status)
    : Promise<any> {
    return new Promise((resolve, reject) => {
      this.tagService.getEvaluation(tag)
        .then(evaluation => {
          this.getAllCardsWithEvaluations(tag, cards_type, status)
            .then(cardsAndEval => {
              const data: any = { ...tag };
              data.evaluation = evaluation;
              data.cards = cardsAndEval;
              resolve(data);
            });
        });
    });
  }

  getAllTagWithEvaluations(tags: Tag[],
    cards_type?: string[],
    status?: Status)
    : Promise<any> {
    return new Promise((resolve, reject) => {
      const promises = tags.map(tag => this.getTagWithEvaluations(tag, cards_type, status));
      Promise.all(promises).then(data_tags => resolve(data_tags));
    });
  }

  getAnalysisWithEvaluations(analysis: Analysis,
    cards_type?: string[],
    status?: Status)
    : Promise<any> {
    return new Promise((resolve, reject) => {
      this.analysisService.getEvaluation(analysis)
        .then(evaluation => {
          this.analysisService
            .getAllTags(analysis, status)
            .then(tags => {
              this.getAllTagWithEvaluations(tags, cards_type, status)
                .then(data_tags => {
                  const data: any = { ...analysis };
                  data.tags = data_tags;
                  data.evaluation = evaluation;
                  resolve(data);
                })
            })
        });
    });
  }

  formatExcelTag(data: any): Sheet {
    const sheets: Sheet = {};
    const sheetName: string[] = [];
    for (let name in data) {
      const card = data[name].values;

      if (!card) continue;

      switch (name) {
        case 'beacons':
          const beacon_card = [...card].map((x :any) => {
            delete x.query; //FIXME
            return x;
          });
          const beacon_sheet = name;
          sheetName.push(beacon_sheet);
          sheets[beacon_sheet] = utils.json_to_sheet(beacon_card);
        break;
        case 'localstorage':
          const localstorage_card = [...card].map((x :any) => {
            try {
              const value = typeof x.value != "string"? JSON.stringify(x.value) : x.value; 
              if (value.length > 32760) {
                return value.slice(0, 32760) + "(...)"  //Maxium text lengh for excel
              }
            } catch{

            }

            return x;
          });
          const localstorage_sheet = name;
          sheetName.push(localstorage_sheet);
          sheets[localstorage_sheet] = utils.json_to_sheet(localstorage_card);
        break;

        case 'cookies':
        case 'evaluations':
        case 'unsafeForms':
        case 'traffic':
          const new_sheet = name;
          sheetName.push(new_sheet);
          sheets[new_sheet] = utils.json_to_sheet(card);
          break;
        case 'testSSL':
          const testssl_protocols = "testssl protocols";
          sheetName.push(testssl_protocols);
          sheets[testssl_protocols] = utils.json_to_sheet(card.protocols);
          const testssl_vulnerabilities = "testssl vulnerabilities";
          sheetName.push(testssl_vulnerabilities);
          sheets[testssl_vulnerabilities] = utils.json_to_sheet(card.vulnerabilities);
          break;
        case 'secure_connection':
        //case 'source':
        case 'info':
        case 'tag':
          const new_sheet_test = name;
          sheetName.push(new_sheet_test);
          sheets[new_sheet_test] = utils.json_to_sheet([card]);
          break;

        default:
          break;
      }

    }

    return sheets;
  }

  toXLXS(data: any): Blob {
    const sheets = this.formatExcelTag(data);
    const sheetName = Object.keys(sheets);
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const excelBuffer: any = write({ Sheets: sheets, SheetNames: sheetName }, { bookType: 'xlsx', type: 'buffer' });
    return new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });

  }

  fromCard(card: Card, evaluations_opt: string[] | null): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cardService.getEvaluation(card)
        .then(evaluation => {

          function filter_details(lines: Details[], evaluations_opt: string[] | null): Details[] {
            let fitered_line: Details[] = [];

            // Stringify log calls and values
            lines.forEach((line :any) => {
              if(line.log){
                line.log = line.log.stacks;
              }

              if(line.value && typeof(line.value)!="string"){
                line.value = JSON.stringify(line.value);
              }
            });

            if (!evaluations_opt || evaluations_opt.includes('All evaluations')) {
              return lines;
            }

            if (evaluations_opt.includes('No evaluation')) {
              fitered_line = fitered_line.concat(lines.filter(line => line.status == 'pending'));
            }

            if (evaluations_opt.includes('Compliant')) {
              fitered_line = fitered_line.concat(lines.filter(line => line.status == 'compliant'));
            }

            if (evaluations_opt.includes('Not compliant')) {
              fitered_line = fitered_line.concat(lines.filter(line => line.status == 'not_compliant'));
            }

            if (evaluations_opt.includes('To be defined')) {
              fitered_line = fitered_line.concat(lines.filter(line => line.status == 'TBD'));
            }

            return fitered_line;
          }

          if (evaluations_opt && !evaluations_opt.includes('All evaluations')) {
            if (evaluation) {
              if (!evaluations_opt.includes('Comments')) {
                delete (evaluation as any).evaluation_comment;
              }
              if (!evaluations_opt.includes('Global Evaluation')) {
                delete (evaluation as any).status;
              }
            }
          }

          switch (card.kind) {
            case 'cookie':
            case 'cookie_cache':
            case 'cookie_requests':
              const cookieCard = (card as CookieCard);
              const key = card.kind == 'cookie' ? "cookies": card.kind;
              resolve({ [key]: {values : filter_details(cookieCard.cookieLines, evaluations_opt), evaluation: evaluation }});
              break;
            case 'localstorage':
              const localstorageCard = (card as LocalStorageCard);
              resolve({ localstorage : {values : filter_details(localstorageCard.localStorageLines, evaluations_opt), evaluation: evaluation }});
              break;
            case 'https':
              const httpCard = (card as HTTPCard);
              resolve({ secure_connection: {values : {"https_redirect": httpCard.https_redirect, "https_support":httpCard.https_support, "redirects":httpCard.redirects?(httpCard.redirects as any)[0]:null}, evaluation: evaluation }});
              break;
            case 'traffic':
              const trafficCard = (card as TrafficCard);
              const requests = trafficCard.requests;
              resolve({ traffic:  {values : requests['thirdParty'].map(request =>({'requested':request})), evaluation: evaluation }});
              break;
            case 'forms':
              const formCard = (card as UnsafeFormsCard);
              resolve({ unsafeForms :  {values : formCard.unsafeForms, evaluation: evaluation }});
              break;
            case 'beacons':
              const beaconCard = (card as BeaconCard);
              resolve({ beacons: {values :filter_details(beaconCard.beaconLines, evaluations_opt), evaluation: evaluation }});
              break;
            case 'testSSL':
              const testsslCard = (card as TestSSLCard);
              resolve({ testSSL: {values : {protocols:filter_details(testsslCard.protocols, evaluations_opt), vulnerabilities:filter_details(testsslCard.vulnerabilities, evaluations_opt)}, evaluation: evaluation }});
              break;
            case 'image':
              const screenshotCard = (card as ScreenshotCard);
              let reader = new FileReader();
              reader.readAsDataURL(screenshotCard.image);
              reader.onloadend = function() {
                resolve({ screenshot: {values : {src:reader.result, name:screenshotCard.name}, evaluation: evaluation }});
              }
              break;
            case 'html':
              const htmlCard = (card as SourceCard);
              resolve({ source: {values :htmlCard, evaluation: evaluation }});
              break;
            case 'info':
              const infoCard = (card as InfoCard);
              resolve({ info: {
                values : {
                'chrome_version':infoCard.chrome_version, 
                'tool_version':infoCard.tool_version,
                'user_agent':infoCard.user_agent,
                'start_time':infoCard.start_time,
                'end_time':infoCard.end_time,
                'visited_urls':infoCard.visited_urls
              } 
              }});
              break;
            default:
              resolve({});
          }
        });
    })
  }

  private filter_evaluation(evaluation: Evaluation | null, evaluations_opt: string[] | null): Boolean {
    if (!evaluations_opt || evaluations_opt.includes('All evaluations')) {
      return false;
    }

    if (evaluations_opt.includes('No evaluation') && !evaluation) {
      return false;
    }

    if (evaluation && evaluations_opt.includes('Compliant') && evaluation.status == 'compliant') {
      return false;
    }

    if (evaluation && evaluations_opt.includes('Not compliant') && evaluation.status == 'not_compliant') {
      return false;
    }

    if (evaluation && evaluations_opt.includes('To be defined') && evaluation.status == 'TBD') {
      return false;
    }

    return true;
  }

  fromTag(tag: Tag, cards_opt: string[] | null, evaluations_opt: string[] | null): Promise<any> {
    return new Promise((resolve, reject) => {
      const res = {};
      
      this.tagService.getAllCards(tag)
        .then(async (cards) => {

          if (evaluations_opt) {
            evaluations_opt = [...evaluations_opt];
            evaluations_opt.push('Global Evaluation');
          }

          let json_tag: { [key: string]: any } = {
            screenshots: []
          };

          if (cards_opt && !cards_opt.includes('All cards')) {
            cards = cards.filter(card => cards_opt.includes(card.name));
          }
          
          for (let card of cards) {
            const json_card = await this.fromCard(card, evaluations_opt);

            if (this.filter_evaluation(json_card.evaluation, evaluations_opt)) {
              continue;
            }

            if ('screenshot' in json_card) {
              const screenshot = json_card['screenshot'];
              json_tag['screenshots'].push(screenshot);
              delete json_card['screenshot'];
            } else {
              json_tag = { ...json_tag, ...json_card };
            }
          }

          if (evaluations_opt && (evaluations_opt.includes("All evaluations") || evaluations_opt.includes("Comments"))) {
            const evaluation = await this.tagService.getEvaluation(tag) as any;
            if (evaluation){
              const evaluations = [];
              if(evaluation.id) delete evaluation.id;
              evaluation["name"] = tag.name;
              evaluations.push(evaluation);
              json_tag["evaluation"] = evaluation;
              const card_and_evals = await this.tagService.getAllCardsWithEvaluation(tag);
              for (let card_and_eval of card_and_evals){
                const card_eval = card_and_eval.evaluation as any;
                if (card_eval){
                  if(card_eval.id) delete card_eval.id;
                  card_eval["name"] = card_and_eval.card.name;
                  evaluations.push(card_eval);
                }
              }

              json_tag["evaluations"] = evaluations;
            }
          }
          
          if(tag.id) delete (tag as any).id;
          //if(tag.cards) delete (tag as any).cards;
          json_tag['tag'] = tag;
          resolve(json_tag);
        });
    });
  }

  fromAnalysis(analysis: Analysis, tags_opt: string[] | null, cards_opt: string[] | null, evaluations_opt: string[] | null): Promise<any> {
    return new Promise((resolve, reject) => {
      this.analysisService.getAllTagsWithEvaluation(analysis)
        .then(tags_and_evals => {

          tags_and_evals = tags_and_evals.filter(tag_eval => !this.filter_evaluation(tag_eval.evaluation, evaluations_opt))

          let tags = tags_and_evals.map(tag_eval => tag_eval.tag);

          if (tags_opt && !tags_opt.includes('All tags')) {
            tags = tags.filter(tag => tags_opt.includes(tag.name));
          }

          const tags_promises = tags.map(tag => this.fromTag(tag, cards_opt, evaluations_opt));

          Promise.all(tags_promises)
            .then(tags => {
              resolve({ analysis: analysis, tags: tags });
            })
        })
    });
  }

  print_to_docx(htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string){
    return (window as any).electron.print_to_docx(htmlString, headerHTMLString, documentOptions, footerHTMLString);
  }

  print_to_pdf(htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string){
    return (window as any).electron.print_to_pdf(htmlString, headerHTMLString, documentOptions, footerHTMLString);
  }
}
