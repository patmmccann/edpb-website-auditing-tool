import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { Details } from 'src/app/models/details.model';
import { Status } from 'src/app/models/evaluation.model';

@Component({
  selector: 'app-cookie-details',
  templateUrl: './cookie-details.component.html',
  styleUrls: ['./cookie-details.component.scss']
})
export class CookieDetailsComponent implements OnInit{
  @Input() line : CookieLine | null = null;
    
  constructor(
  ) {
  }

  ngOnInit(): void {
    
  }

}
