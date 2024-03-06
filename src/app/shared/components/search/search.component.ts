import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Card } from 'src/app/models/card.model';
import { BeaconLine } from 'src/app/models/cards/beacon-card.model';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { Status, allStatus } from 'src/app/models/evaluation.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { CookieKnowledge } from 'src/app/models/knowledges/cookie-knowledge.model';
import { LocalStorageKnowledge } from 'src/app/models/knowledges/localstorage-knowledge.model';
import { FilterForStatus, FilterForBeacon, FilterForCookie, FilterForLocalStorage } from 'src/app/pipes/filters.pipe';
import { CardService } from 'src/app/services/card.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [FilterForStatus, FilterForCookie, FilterForLocalStorage, FilterForBeacon]
})
export class SearchComponent {

  selector: string[] = [];

  @Input() card: Card = new Card('', '');

  @Output() searchStatusEvent = new EventEmitter<any>();
  searchStatusForm: FormGroup = new FormGroup({});

  @Output() searchCookieEvent = new EventEmitter<any>();
  searchCookieForm: FormGroup = new FormGroup({});

  @Output() searchLocalStorageEvent = new EventEmitter<any>();
  searchLocalStorageForm: FormGroup = new FormGroup({});

  @Output() searchBeaconEvent = new EventEmitter<any>();
  searchBeaconForm: FormGroup = new FormGroup({});

  @Output() searchKnowledgeEvent = new EventEmitter<any>();
  searchKnowledgeForm: FormGroup = new FormGroup({});


  cookieKnowledges: CookieKnowledge[] = [];
  localstorageKnowledges: LocalStorageKnowledge[] = [];

  constructor(
    private cardService: CardService,
    private formBuilder: FormBuilder,
    private filterForStatus: FilterForStatus,
    private filterForCookie: FilterForCookie,
    private filterForLocalStorage: FilterForLocalStorage,
    private filterForBeacon: FilterForBeacon,
    public knowledgeBaseService: KnowledgeBaseService
  ) {

    knowledgeBaseService.getAll()
      .then((result: any) => {
        this.cookieKnowledges = result.filter((x: KnowledgeBase) => x.category == 'cookie' && x.used);
        this.localstorageKnowledges = result.filter((x: KnowledgeBase) => x.category == 'localstorage' && x.used);
      });

    this.searchStatusForm = this.formBuilder.group({
      searchStatus: []
    });

    this.searchStatusForm.valueChanges.subscribe((selectedValue: any) => {
      this.searchStatusEvent.emit(selectedValue.searchStatus);
    });

    this.searchKnowledgeForm = this.formBuilder.group({
      searchKnowledge: [],
      searchCategory: []
    });

    this.searchKnowledgeForm.valueChanges.subscribe((selectedValue: any) => {
      this.searchKnowledgeEvent.emit(selectedValue);
    });

    this.searchCookieForm = this.formBuilder.group({
      searchDomain: "",
      searchName: ""
    });

    this.searchCookieForm.valueChanges.subscribe((selectedValue: any) => {
      this.searchCookieEvent.emit(selectedValue);
    });


    this.searchLocalStorageForm = this.formBuilder.group({
      searchHost: "",
      searchKey: ""
    });

    this.searchLocalStorageForm.valueChanges.subscribe((selectedValue: any) => {
      this.searchLocalStorageEvent.emit(selectedValue);
    });

    this.searchBeaconForm = this.formBuilder.group({
      searchUrl: ""
    });

    this.searchBeaconForm.valueChanges.subscribe((selectedValue: any) => {
      this.searchBeaconEvent.emit(selectedValue);
    });
  }

  removeFilter(val: any) {
    this.selector = this.selector.filter(x => x != val);

    switch (val) {
      case 'from_values':
        this.searchStatusForm.setValue({
          searchStatus: []
        })
        this.searchCookieForm.setValue({
          searchDomain: "",
          searchName: ""
        })
        this.searchLocalStorageForm.setValue({
          searchHost: "",
          searchKey: ""
        })
        this.searchBeaconForm.setValue({
          searchUrl: ""
        })
        break;
      case 'from_knowledge':
        this.searchKnowledgeForm.setValue({
          searchKnowledge: [],
          searchCategory: []
        });
        break;
    }
  }

  mark_as(event: any) {
    const test = this.searchStatusForm.value.searchStatus;
    switch (this.card?.kind) {
      case 'cookie':
        const cookieCard = this.cardService.castToCookieCard(this.card);
        this.filterForStatus.transform(
          this.filterForCookie.transform(cookieCard.cookieLines, this.searchCookieForm.value),
          this.searchStatusForm.value.searchStatus)
          .map((line: CookieLine) => line.status = event.value);

        this.cardService.update(cookieCard);
        break;
      case 'localstorage':
        const localstorageCard = this.cardService.castToLocalStorageCard(this.card);
        this.filterForStatus.transform(
          this.filterForLocalStorage.transform(localstorageCard.localStorageLines, this.searchLocalStorageForm.value),
          this.searchStatusForm.value.searchStatus)
          .map((line: LocalStorageLine) => line.status = event.value);

        this.cardService.update(localstorageCard);
        break;
      case 'beacons':
        const beaconCard = this.cardService.castToBeaconCard(this.card);
        this.filterForStatus.transform(
          this.filterForBeacon.transform(beaconCard.beaconLines, this.searchBeaconForm.value),
          this.searchStatusForm.value.searchStatus)
          .map((line: BeaconLine) => line.status = event.value);

        this.cardService.update(beaconCard);
        break;
    }
  }

  get allStatus() {
    return allStatus;
  }
}
