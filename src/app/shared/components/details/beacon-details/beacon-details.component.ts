import { Component, OnInit, Input } from '@angular/core';
import { BeaconLine } from 'src/app/models/cards/beacon-card.model';

@Component({
  selector: 'app-beacon-details',
  templateUrl: './beacon-details.component.html',
  styleUrls: ['./beacon-details.component.scss']
})
export class BeaconDetailsComponent implements OnInit {

  @Input() line : BeaconLine | null = null;
  JSON : any = null;

  constructor() { 
    this.JSON = JSON
  }

  ngOnInit(): void {
  }

}
