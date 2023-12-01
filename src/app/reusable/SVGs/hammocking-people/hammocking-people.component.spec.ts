import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HammockingPeopleComponent } from './hammocking-people.component';

describe('HammockingPeopleComponent', () => {
  let component: HammockingPeopleComponent;
  let fixture: ComponentFixture<HammockingPeopleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HammockingPeopleComponent]
    });
    fixture = TestBed.createComponent(HammockingPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
