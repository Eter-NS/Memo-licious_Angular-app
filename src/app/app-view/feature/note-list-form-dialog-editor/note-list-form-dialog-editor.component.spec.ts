import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteListFormDialogEditorComponent } from './note-list-form-dialog-editor.component';

describe('NoteListFormDialogEditorComponent', () => {
  let component: NoteListFormDialogEditorComponent;
  let fixture: ComponentFixture<NoteListFormDialogEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteListFormDialogEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteListFormDialogEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
