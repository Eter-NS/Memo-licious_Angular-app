import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppViewListComponent } from './app-view-list.component';

describe('AppViewListComponent', () => {
  let component: AppViewListComponent;
  let fixture: ComponentFixture<AppViewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppViewListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
