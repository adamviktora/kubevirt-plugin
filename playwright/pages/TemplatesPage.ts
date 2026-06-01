import { expect, Page } from '@playwright/test';

import { NAV_TIMEOUT, SECOND } from '../utils/constants';
import { byTest, byTestId } from '../utils/locators';

import { ResourceListPage } from './ResourceListPage';

const FILTER_DROPDOWN_TOGGLE = 'filter-dropdown-toggle';

export class TemplatesPage extends ResourceListPage {
  constructor(page: Page) {
    super(page);
  }

  /** Close the clone template modal via the Cancel button. */
  async closeCloneModal() {
    await byTest(this.page, 'cancel-button').click();
  }

  async expectCloneModalVisible() {
    await expect(byTest(this.page, 'dialog-modal')).toBeVisible({ timeout: NAV_TIMEOUT });
  }

  async expectNoSourceAvailableLabel() {
    await expect(this.page.getByText('Source available')).toHaveCount(0);
  }

  async expectTemplateNotVisible(metadataName: string) {
    await expect(byTestId(this.page, metadataName)).toHaveCount(0);
  }

  async expectTemplateVisible(metadataName: string) {
    await expect(byTestId(this.page, metadataName)).toBeVisible();
  }

  /**
   * Open the filter dropdown and activate a row filter.
   * Clicks the filter item container (label) rather than the hidden PF6 checkbox
   * input directly, which avoids the "did not change its state" error.
   */
  async filterByType(rowFilterKey: string) {
    await byTestId(this.page, FILTER_DROPDOWN_TOGGLE).waitFor({
      state: 'visible',
      timeout: 30 * SECOND,
    });
    await byTestId(this.page, FILTER_DROPDOWN_TOGGLE).click();
    await this.page.locator(`[data-test-row-filter="${rowFilterKey}"]`).click();
  }

  /** @param ns Specific namespace, or omit / pass 'all-namespaces' for all namespaces view. */
  async navigate(ns?: string) {
    const nsPath = ns && ns !== 'all-namespaces' ? `ns/${ns}` : 'all-namespaces';
    await super.navigate(`/k8s/${nsPath}/templates.openshift.io~v1~Template`);
  }

  /** Click the "Actions" dropdown on the template details page. */
  async openActionsDropdown() {
    await byTest(this.page, 'actions-dropdown').click();
  }

  async openTemplate(testId: string) {
    await byTestId(this.page, testId).click();
  }

  /** Open the "Create template" dropdown and click a menuitem by visible name. */
  async selectCreateOption(optionName: string) {
    await this.clickCreate();
    await this.page.getByRole('menuitem', { name: optionName }).click();
  }

  /** Click a menuitem in an open kebab / Actions dropdown. */
  async selectKebabAction(actionName: string) {
    await this.page.getByRole('menuitem', { name: actionName }).click();
  }
}
