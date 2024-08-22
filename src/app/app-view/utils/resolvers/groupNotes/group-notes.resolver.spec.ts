import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { groupNotesResolver } from './group-notes.resolver';
import { NoteGroupModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { NotesService } from 'src/app/app-view/data-access/notes/notes.service';
import { BehaviorSubject, Observable } from 'rxjs';

describe('groupNotesResolver', () => {
  const routerMock = jasmine.createSpyObj<Router>(['navigateByUrl']);
  const notesSubject = new BehaviorSubject<NoteGroupModel[]>([]);
  const notesServiceMock = {
    notes$: notesSubject,
  };

  const executeResolver: ResolveFn<NoteGroupModel[]> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      groupNotesResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: NotesService, useValue: notesServiceMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });

  it('should return an array of NoteGroupModel', fakeAsync(() => {
    notesSubject.next([
      {
        createdAt: Date.now(),
        id: 'xxx',
        notes: [],
        title: 'xxx',
      } satisfies NoteGroupModel,
    ]);

    TestBed.runInInjectionContext(() => {
      const result = executeResolver(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<NoteGroupModel[]>;
      let value: NoteGroupModel[] = [];

      const subscription = result.subscribe((result) => {
        value = result;
      });

      tick(1_000);
      subscription.unsubscribe();

      expect(value.length).toBeGreaterThan(0);
      expect(value[0].createdAt).toBeDefined();
    });
  }));

  it('should call navigateByUrl when an error occurred in the stream', fakeAsync(() => {
    notesSubject.error(new Error('Error'));
    const navigateByUrlSpy = routerMock.navigateByUrl;

    TestBed.runInInjectionContext(() => {
      const result = executeResolver(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<NoteGroupModel[]>;

      const subscription = result.subscribe();

      tick(1_000);
      subscription.unsubscribe();

      expect(navigateByUrlSpy).toHaveBeenCalledWith('/app/notes');
    });
  }));
});
