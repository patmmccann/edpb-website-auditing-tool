import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLocalStorageDetailsComponent } from './storage-local-storage-details.component';

describe('StorageLocalStorageDetailsComponent', () => {
  let component: StorageLocalStorageDetailsComponent;
  let fixture: ComponentFixture<StorageLocalStorageDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StorageLocalStorageDetailsComponent]
    });
    fixture = TestBed.createComponent(StorageLocalStorageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
