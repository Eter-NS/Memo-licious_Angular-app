import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppGroupDetailsComponent } from './app-group-details.component';

describe('AppGroupDetailsComponent', () => {
  let component: AppGroupDetailsComponent;
  let fixture: ComponentFixture<AppGroupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppGroupDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
