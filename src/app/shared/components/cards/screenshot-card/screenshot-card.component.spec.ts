import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenshotCardComponent } from './screenshot-card.component';

describe('ScreenshotCardComponent', () => {
  let component: ScreenshotCardComponent;
  let fixture: ComponentFixture<ScreenshotCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenshotCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenshotCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
