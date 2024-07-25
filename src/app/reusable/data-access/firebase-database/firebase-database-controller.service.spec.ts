import { TestBed } from '@angular/core/testing';
import { FirebaseDatabaseControllerService } from './firebase-database-controller.service';
import { Provider } from '@angular/core';
import { Database } from '@angular/fire/database';

describe(`FirebaseDatabaseControllerService`, () => {
  let service: FirebaseDatabaseControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Database, useValue: {} }] satisfies Provider[],
    });

    service = TestBed.inject(FirebaseDatabaseControllerService);
  });

  it(`should be created`, () => {
    expect(service).toBeTruthy();
  });
});
