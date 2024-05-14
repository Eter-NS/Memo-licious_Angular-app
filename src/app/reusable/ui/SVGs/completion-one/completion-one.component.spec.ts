import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletionOneComponent } from './completion-one.component';

describe('CompletionOneComponent', () => {
  let component: CompletionOneComponent;
  let fixture: ComponentFixture<CompletionOneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompletionOneComponent]
    });
    fixture = TestBed.createComponent(CompletionOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
