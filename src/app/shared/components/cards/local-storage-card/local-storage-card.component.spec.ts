import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalStorageCardComponent } from './local-storage-card.component';

describe('LocalStorageCardComponent', () => {
  let component: LocalStorageCardComponent;
  let fixture: ComponentFixture<LocalStorageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalStorageCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalStorageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
