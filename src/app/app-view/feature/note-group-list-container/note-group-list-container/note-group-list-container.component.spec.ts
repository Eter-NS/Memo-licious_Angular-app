import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteGroupListContainerComponent } from './note-group-list-container.component';

describe('NoteGroupListContainerComponent', () => {
  let component: NoteGroupListContainerComponent;
  let fixture: ComponentFixture<NoteGroupListContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteGroupListContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoteGroupListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
