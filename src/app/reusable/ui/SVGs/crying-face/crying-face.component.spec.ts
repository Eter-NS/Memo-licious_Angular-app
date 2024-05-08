import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryingFaceComponent } from './crying-face.component';

describe('CryingFaceComponent', () => {
  let component: CryingFaceComponent;
  let fixture: ComponentFixture<CryingFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryingFaceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryingFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
