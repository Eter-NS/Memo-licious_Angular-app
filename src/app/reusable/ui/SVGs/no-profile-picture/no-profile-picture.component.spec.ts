import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoProfilePictureComponent } from './no-profile-picture.component';

describe('NoProfilePictureComponent', () => {
  let component: NoProfilePictureComponent;
  let fixture: ComponentFixture<NoProfilePictureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoProfilePictureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
