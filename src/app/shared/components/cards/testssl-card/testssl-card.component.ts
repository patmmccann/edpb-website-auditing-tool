import { Component, OnInit, Input } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { viewContext } from 'src/app/models/card.model';
import { TestSSLCard } from 'src/app/models/cards/test-sslcard.model';
import { Status } from 'src/app/models/evaluation.model';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-testssl-card',
  templateUrl: './testssl-card.component.html',
  styleUrls: ['./testssl-card.component.scss']
})
export class TestsslCardComponent implements OnInit {
  @Input() card: TestSSLCard = new TestSSLCard({}, null, null);
  @Input() context: viewContext = 'evaluate';

  constructor(
    private cardService: CardService
  ) {

  }

  ngOnInit(): void {
  }

  sortProtocolsData(sort: Sort) {
     this.card.protocols = this.card.protocols.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'finding':
          return compare(a.finding, b.finding, isAsc);
        case 'severity':
          return compare(a.severity, b.severity, isAsc);
        case 'evaluation':
            return compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }
  
  sortVulnerabilitiesData(sort: Sort) {
    this.card.vulnerabilities = this.card.vulnerabilities.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'finding':
          return compare(a.finding, b.finding, isAsc);
        case 'severity':
          return compare(a.severity, b.severity, isAsc);
        case 'severity':
          return compare(a.cve, b.cve, isAsc);
        case 'evaluation':
            return compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }

  setEvaluation(line: any, status: Status) {
    line.status = status;
    this.cardService.update(this.card);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}