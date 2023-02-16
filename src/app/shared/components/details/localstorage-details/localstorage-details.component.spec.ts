import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalstorageDetailsComponent } from './localstorage-details.component';

describe('LocalstorageDetailsComponent', () => {
  let component: LocalstorageDetailsComponent;
  let fixture: ComponentFixture<LocalstorageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalstorageDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalstorageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
