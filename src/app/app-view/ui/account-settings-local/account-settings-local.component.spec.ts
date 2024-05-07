import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsLocalComponent } from './account-settings-local.component';

describe('AccountSettingsLocalComponent', () => {
  let component: AccountSettingsLocalComponent;
  let fixture: ComponentFixture<AccountSettingsLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsLocalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountSettingsLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
