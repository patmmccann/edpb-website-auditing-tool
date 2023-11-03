import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsComponent } from './tags.component';
import { MaterialAllModule } from 'src/app/material.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagsComponent ],
      imports:      [ MaterialAllModule, AppRoutingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
