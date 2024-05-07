import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SparklesEmojiComponent } from './sparkles-emoji.component';

describe('SparklesEmojiComponent', () => {
  let component: SparklesEmojiComponent;
  let fixture: ComponentFixture<SparklesEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SparklesEmojiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SparklesEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
