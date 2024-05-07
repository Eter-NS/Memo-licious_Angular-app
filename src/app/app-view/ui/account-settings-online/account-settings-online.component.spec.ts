import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsOnlineComponent } from './account-settings-online.component';

describe('AccountSettingsOnlineComponent', () => {
  let component: AccountSettingsOnlineComponent;
  let fixture: ComponentFixture<AccountSettingsOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsOnlineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountSettingsOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
