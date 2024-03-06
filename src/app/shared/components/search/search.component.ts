import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Card } from 'src/app/models/card.model';
import { BeaconLine } from 'src/app/models/cards/beacon-card.model';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { Status, allStatus } from 'src/app/models/evaluation.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { FilterForStatus, filterForBeacon, filterForCookie, filterForLocalStorage } from 'src/app/pipes/filters.pipe';
import { CardService } from 'src/app/services/card.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [FilterForStatus, filterForCookie, filterForLocalStorage, filterForBeacon]
})
export class SearchComponent {
  
  selector: string[] = [];

  @Input() card: Card = new Card('','');

  @Output() searchStatusEvent = new EventEmitter<any>();
  searchStatusForm :FormGroup = new FormGroup({});

  @Output() searchCookieEvent = new EventEmitter<any>();
  searchCookieForm :FormGroup = new FormGroup({});

  @Output() searchLocalStorageEvent = new EventEmitter<any>();
  searchLocalStorageForm :FormGroup = new FormGroup({});

  @Output() searchBeaconEvent = new EventEmitter<any>();
  searchBeaconForm :FormGroup = new FormGroup({});

  hasCookieKnowledge = false;
  hasLocalstorageKnowledge = false;

  constructor(
    private cardService: CardService,
    private formBuilder: FormBuilder,
    private filterForStatus : FilterForStatus,
    private filterForCookie : filterForCookie,
    private filterForLocalStorage : filterForLocalStorage,
    private filterForBeacon : filterForBeacon,
    private knowledgeBaseService : KnowledgeBaseService
  ) {

    knowledgeBaseService.getAll()
    .then((result: any) => {
      this.hasCookieKnowledge = result.filter(((x:KnowledgeBase)=> x.category == 'cookie')).length >0;
      this.hasLocalstorageKnowledge  = result.filter(((x:KnowledgeBase)=> x.category == 'localstorage')).length >0;
    });

    this.searchStatusForm = this.formBuilder.group({
      searchStatus : []
    });

    this.searchStatusForm.valueChanges.subscribe((selectedValue :any) => {
      this.searchStatusEvent.emit(selectedValue.searchStatus);
    });

    this.searchCookieForm = this.formBuilder.group({
      searchDomain : "",
      searchName : ""
    });

    this.searchCookieForm.valueChanges.subscribe((selectedValue :any) => {
      this.searchCookieEvent.emit(selectedValue);
    });


    this.searchLocalStorageForm = this.formBuilder.group({
      searchHost : "",
      searchKey : ""
    });

    this.searchLocalStorageForm.valueChanges.subscribe((selectedValue :any) => {
      this.searchLocalStorageEvent.emit(selectedValue);
    });

    this.searchBeaconForm = this.formBuilder.group({
      searchUrl : ""
    });

    this.searchBeaconForm.valueChanges.subscribe((selectedValue :any) => {
      this.searchBeaconEvent.emit(selectedValue);
    });
  }

  removeFilter(val: any) {
    this.selector = this.selector.filter(x => x != val);

    switch(val){
      case 'from_values':
        this.searchStatusForm.setValue({
          searchStatus : []
        })
        this.searchCookieForm.setValue({
          searchDomain : "",
          searchName : ""
        })
        this.searchLocalStorageForm.setValue({
          searchHost : "",
          searchKey : ""
        })
        this.searchBeaconForm.setValue({
          searchUrl : ""
        })
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
          .map((line :CookieLine)=> line.status = event.value);

        this.cardService.update(cookieCard);
        break;
      case 'localstorage':
        const localstorageCard = this.cardService.castToLocalStorageCard(this.card);
        this.filterForStatus.transform(
          this.filterForLocalStorage.transform(localstorageCard.localStorageLines, this.searchLocalStorageForm.value),
          this.searchStatusForm.value.searchStatus)
          .map((line :LocalStorageLine)=> line.status = event.value);

        this.cardService.update(localstorageCard);
        break;
      case 'beacons':
        const beaconCard = this.cardService.castToBeaconCard(this.card);
        this.filterForStatus.transform(
          this.filterForBeacon.transform(beaconCard.beaconLines, this.searchBeaconForm.value),
          this.searchStatusForm.value.searchStatus)
          .map((line :BeaconLine)=> line.status = event.value);

        this.cardService.update(beaconCard);
        break;
    }
  }

  get allStatus(){
    return allStatus;
  }
}
