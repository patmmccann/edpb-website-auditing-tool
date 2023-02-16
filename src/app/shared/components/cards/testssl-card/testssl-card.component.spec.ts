import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestsslCardComponent } from './testssl-card.component';

describe('TestsslCardComponent', () => {
  let component: TestsslCardComponent;
  let fixture: ComponentFixture<TestsslCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestsslCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestsslCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
