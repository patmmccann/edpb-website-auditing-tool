import { Component, OnInit, Input } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { HTTPCard } from 'src/app/models/cards/http-card.model';

@Component({
  selector: 'app-http-card',
  templateUrl: './http-card.component.html',
  styleUrls: ['./http-card.component.scss']
})
export class HttpCardComponent implements OnInit {
  @Input() card: HTTPCard = new HTTPCard(null);;
  @Input() context: viewContext = 'evaluate';

  constructor() { }

  ngOnInit(): void {
  }

}
