import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMobileDetailsComponent } from './app-group-mobile-details.component';

describe('AppGroupDetailsComponent', () => {
  let component: GroupMobileDetailsComponent;
  let fixture: ComponentFixture<GroupMobileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMobileDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupMobileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
