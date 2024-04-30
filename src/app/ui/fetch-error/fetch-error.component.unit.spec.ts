import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchErrorComponent } from './fetch-error.component';

describe('FetchErrorComponent', () => {
  let component: FetchErrorComponent;
  let fixture: ComponentFixture<FetchErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FetchErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
});
