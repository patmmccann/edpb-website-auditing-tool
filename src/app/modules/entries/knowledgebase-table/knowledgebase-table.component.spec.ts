import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgebaseTableComponent } from './knowledgebase-table.component';

describe('KnowledgebaseTableComponent', () => {
  let component: KnowledgebaseTableComponent;
  let fixture: ComponentFixture<KnowledgebaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgebaseTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgebaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
