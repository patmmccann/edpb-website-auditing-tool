import { TestBed } from '@angular/core/testing';

import { AnalysisService } from './analysis.service';
import { cs_CZ, faker } from '@faker-js/faker';
import { allStatus ,Status } from '../models/evaluation.model';
import { kindCard,  allKindCard} from '../models/card.model';
import { ScreenshotCard } from '../models/cards/screenshot-card.model';

describe('AnalysisService', () => {
  let service: AnalysisService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse and export data', async () => {
    function createEvaluation(){
      return {
        "status": faker.helpers.arrayElement<Status>(allStatus),
        "created_at": faker.date.anytime(),
        "updated_at": faker.date.anytime(),
        "evaluation_comment": faker.lorem.text()
      }
    }

    async function createCards(){
      const cards =[];
      const kind_cards = faker.helpers.arrayElements<kindCard>(allKindCard);
      for (let kind_card of kind_cards){
        const card :any = {
          'kind' : kind_card,
          'evaluation': createEvaluation(),
          'name': faker.lorem.word()
        };
        switch(kind_card){
          case 'image':
            const img = await fetch(faker.image.urlLoremFlickr());
            const blob =  await img.blob();
            card["image"] = await ScreenshotCard.blobToBase64(blob);
            break;
        }

        cards.push(card);
      }

      return cards;
    }

    async function createTags(){
      const tags =[];

      for (let i = 0; i < faker.number.int(50); i++) {
        const tag = {
          "name":faker.lorem.word(),
          "source": "browser",
          "created_at": faker.date.anytime(),
          "updated_at": faker.date.anytime(),
          "evaluation": createEvaluation(),
          "cards": await createCards()
        }
        tags.push(tag);
      }

      return tags;
    }

    const analysis=  {
        name:faker.company.name(),
        url:faker.internet.url(),
        source:"browser",
        "created_at": faker.date.anytime(),
        "updated_at": faker.date.anytime(),
        "evaluation":createEvaluation(),
        "tags": await createTags()
      }

      const datasouce = await service.parse({...analysis});
      const datadest = await service.export(datasouce.id);

      expect(analysis).toEqual(datadest);
  });
});
