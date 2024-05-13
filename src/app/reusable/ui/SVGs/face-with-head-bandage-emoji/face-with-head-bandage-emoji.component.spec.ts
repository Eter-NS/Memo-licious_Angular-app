import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceWithHeadBandageEmojiComponent } from './face-with-head-bandage-emoji.component';

describe('FaceWithHeadBandageEmojiComponent', () => {
  let component: FaceWithHeadBandageEmojiComponent;
  let fixture: ComponentFixture<FaceWithHeadBandageEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceWithHeadBandageEmojiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FaceWithHeadBandageEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
