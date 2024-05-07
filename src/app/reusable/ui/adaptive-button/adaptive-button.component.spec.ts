import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdaptiveButtonComponent } from './adaptive-button.component';

describe('AdaptiveButtonComponent', () => {
  let component: AdaptiveButtonComponent;
  let fixture: ComponentFixture<AdaptiveButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdaptiveButtonComponent]
    });
    fixture = TestBed.createComponent(AdaptiveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
