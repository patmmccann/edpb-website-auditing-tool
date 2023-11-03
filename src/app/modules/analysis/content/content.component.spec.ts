import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentComponent } from './content.component';
import { MaterialAllModule } from 'src/app/material.module';
import { GlobalCardComponent } from './cards/global-card/global-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentComponent, GlobalCardComponent],
      imports:      [ MaterialAllModule, SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
