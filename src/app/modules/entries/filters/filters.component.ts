import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  searchTerm : String ="";
  constructor() { }

  ngOnInit(): void {
  }

  onCleanSearch(): void {
    this.searchTerm = '';
  }

}
