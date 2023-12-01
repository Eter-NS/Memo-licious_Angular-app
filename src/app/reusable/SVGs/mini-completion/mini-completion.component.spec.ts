import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCompletionComponent } from './mini-completion.component';

describe('MiniCompletionComponent', () => {
  let component: MiniCompletionComponent;
  let fixture: ComponentFixture<MiniCompletionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MiniCompletionComponent]
    });
    fixture = TestBed.createComponent(MiniCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
