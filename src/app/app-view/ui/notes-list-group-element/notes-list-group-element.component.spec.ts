import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesListGroupElementComponent } from './notes-list-group-element.component';

describe('NotesListGroupElementComponent', () => {
  let component: NotesListGroupElementComponent;
  let fixture: ComponentFixture<NotesListGroupElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesListGroupElementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotesListGroupElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
