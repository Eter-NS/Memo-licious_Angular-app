import { TestBed } from '@angular/core/testing';
import { FirebaseAuthControllerService } from './firebase-auth-controller.service';

describe(`FirebaseAuthControllerService`, () => {
  let service: FirebaseAuthControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(FirebaseAuthControllerService);
  });

  it(`should be created`, () => {
    expect(service).toBeTruthy();
  });
});
