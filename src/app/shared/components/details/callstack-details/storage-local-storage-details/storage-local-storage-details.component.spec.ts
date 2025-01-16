import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLocalStorageDetailsComponent } from './storage-local-storage-details.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('StorageLocalStorageDetailsComponent', () => {
  let component: StorageLocalStorageDetailsComponent;
  let fixture: ComponentFixture<StorageLocalStorageDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MaterialAllModule, SharedModule, StorageLocalStorageDetailsComponent]
});
    fixture = TestBed.createComponent(StorageLocalStorageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
