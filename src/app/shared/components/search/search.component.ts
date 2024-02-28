import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Card } from 'src/app/models/card.model';
import { Status } from 'src/app/models/evaluation.model';
import { FilterForStatus } from 'src/app/pipes/tools';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [FilterForStatus]
})
export class SearchComponent {
  @Input() card: Card | null = null;
  @Output() searchStatusEvent = new EventEmitter<any>();

  selector: string[] = [];
  show_from_knowledge = false;
  show_mark_as = false;
  searchDomain = "";
  searchName = "";
  searchStatusForm :FormGroup = new FormGroup({});
  searchStatus:Status[] = [];


  constructor(
    private cardService: CardService,
    private _statusBuilder: FormBuilder,
    private filterForStatus : FilterForStatus
  ) {
    this.searchStatusForm = this._statusBuilder.group({
      pending : false,
      not_evaluate: false,
      compliant: false,
      not_compliant: false,
      TBD : false
    });

    this.searchStatusForm.valueChanges.subscribe((selectedValue :any) => {
      this.searchStatus  = Object.keys(selectedValue).filter(key => selectedValue[key]) as Status[];
      this.searchStatusEvent.emit(this.searchStatus);
    });
  }

  removeFilter(val: any) {
    this.selector = this.selector.filter(x => x != val);

    switch(val){
      case 'from_columns':
        this.searchStatusForm.setValue({
          pending : false,
          not_evaluate: false,
          compliant: false,
          not_compliant: false,
          TBD : false
        })
        break;
    }
  }

  mark_as(event: any) {
    switch (this.card?.kind) {
      case 'cookie':
        const cookieCard = this.cardService.castToCookieCard(this.card);
        const cookieLines = this.filterForStatus.transform(cookieCard.cookieLines, this.searchStatus);
        for (const line of cookieLines) {
          line.status = event.value;
        }

        this.cardService.update(cookieCard);
        break;
      case 'localstorage':
        const localstorageCard = this.cardService.castToLocalStorageCard(this.card);
        const localStorageLines = this.filterForStatus.transform(localstorageCard.localStorageLines, this.searchStatus);
        for (const line of localStorageLines) {
          line.status = event.value;
        }

        this.cardService.update(localstorageCard);
        break;
      case 'beacons':
        const beaconCard = this.cardService.castToBeaconCard(this.card);
        const beaconLines = this.filterForStatus.transform(beaconCard.beaconLines, this.searchStatus);
        for (const line of beaconLines) {
          line.status = event.value;
        }

        this.cardService.update(beaconCard);
        break;
    }
  }
}
