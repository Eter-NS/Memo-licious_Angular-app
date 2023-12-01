import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebHeaderComponent } from './web-header.component';

describe('WebHeaderComponent', () => {
  let component: WebHeaderComponent;
  let fixture: ComponentFixture<WebHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WebHeaderComponent]
    });
    fixture = TestBed.createComponent(WebHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
