import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppViewComponent } from './app-view.page.component';

describe('AppViewComponent', () => {
  let component: AppViewComponent;
  let fixture: ComponentFixture<AppViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppViewComponent],
    });
    fixture = TestBed.createComponent(AppViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
