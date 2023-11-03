import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavComponent } from './side-nav.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from '../../shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideNavComponent ],
      imports:      [ MaterialAllModule,  RouterTestingModule,SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
