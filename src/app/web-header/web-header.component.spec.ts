import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebHeaderComponent } from './web-header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('WebHeaderComponent', () => {
  let component: WebHeaderComponent;
  let fixture: ComponentFixture<WebHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        WebHeaderComponent,
      ],
    });
    fixture = TestBed.createComponent(WebHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
