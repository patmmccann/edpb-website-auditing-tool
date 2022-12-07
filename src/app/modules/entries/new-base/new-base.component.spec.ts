import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBaseComponent } from './new-base.component';

describe('NewBaseComponent', () => {
  let component: NewBaseComponent;
  let fixture: ComponentFixture<NewBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
