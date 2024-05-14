import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLinkWithHref } from '@angular/router';
import { routes } from '../app.config';

describe('LandingPageComponent', () => {
  let router: Router;

  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes), LandingPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    router.initialNavigation();
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should successfully render app-social-media-list component', () => {
    const appShoppingBagsEmoji = fixture.debugElement.query(
      By.css('app-shopping-bags-emoji')
    );

    expect(appShoppingBagsEmoji).toBeTruthy();
  });

  it('should successfully render app-social-media-list component', () => {
    const appSocialMediaList = fixture.debugElement.query(
      By.css('app-social-media-list')
    );

    expect(appSocialMediaList).toBeTruthy();
  });

  xit('should navigate to "/getting-started/hello" when .get-started element was clicked', async () => {
    const spy = spyOn(router, 'navigate');
    const anchorElement = fixture.debugElement.query(By.css('.get-started'));

    anchorElement.nativeElement.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith(['/getting-started/hello']);
  });

  it('should have routerLink to expected URL', () => {
    const debugElements = fixture.debugElement.queryAll(
      By.directive(RouterLinkWithHref)
    );

    const index = debugElements.findIndex((de) =>
      de.properties['href'].includes('/getting-started/hello')
    );

    expect(index).toBeGreaterThanOrEqual(0);
  });
});
