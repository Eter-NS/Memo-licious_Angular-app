import { ComponentHarness } from '@angular/cdk/testing';

export class FetchErrorHarness extends ComponentHarness {
  static hostSelector = 'app-fetch-error';

  private userMessage = this.locatorFor('[data-test=fetch-error-message]');
  private reloadLink = this.locatorFor('[data-test=fetch-error-reload-link]');
  private emailLink = this.locatorFor('[data-test=fetch-error-email-link]');

  /* getters */

  async getMessage(): Promise<string> {
    const message = await this.userMessage();
    return await message.text();
  }

  async getReloadLink(): Promise<boolean> {
    const link = await this.reloadLink();
    return Boolean(link);
  }

  async getEmailLink(): Promise<boolean> {
    const link = await this.emailLink();
    return Boolean(link);
  }

  /* Setters */

  async clickReloadLink(): Promise<void> {
    const link = await this.reloadLink();
    return await link.dispatchEvent('click');
  }

  async clickEmailLink(): Promise<void> {
    const link = await this.emailLink();
    return await link.dispatchEvent('click');
  }
}
