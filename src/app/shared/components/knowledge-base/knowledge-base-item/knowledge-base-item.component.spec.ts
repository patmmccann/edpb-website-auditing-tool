import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseItemComponent } from './knowledge-base-item.component';

describe('KnowledgeBaseItemComponent', () => {
  let component: KnowledgeBaseItemComponent;
  let fixture: ComponentFixture<KnowledgeBaseItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBaseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
