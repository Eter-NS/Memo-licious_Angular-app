import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteListFormComponent } from './note-list-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NoteListFormComponent', () => {
  let component: NoteListFormComponent;
  let fixture: ComponentFixture<NoteListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, NoteListFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
