import { TestBed } from '@angular/core/testing';

import { NoteRestService } from './note-rest.service';

describe('NotesRestService', () => {
  let service: NoteRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
