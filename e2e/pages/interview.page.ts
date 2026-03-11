import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Interview Chat page
 * Follows Page Object Model pattern for maintainability
 */
export class InterviewPage {
  readonly page: Page;
  readonly setupSection: Locator;
  readonly interviewerButtons: Locator;
  readonly startButton: Locator;
  readonly questionDisplay: Locator;
  readonly answerInput: Locator;
  readonly submitButton: Locator;
  readonly chatMessages: Locator;
  readonly viewResultButton: Locator;
  readonly newInterviewButton: Locator;
  readonly apiKeyInput: Locator;
  readonly loginButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.setupSection = page.locator('text=면접관 선택');
    this.interviewerButtons = page.locator('button').filter({ hasText: /면접관|관점|시각/ });
    this.startButton = page.locator('button:has-text("면접 시작")');
    this.questionDisplay = page.locator('.bg-blue-50, .dark\\:bg-blue-900\\/20');
    this.answerInput = page.locator('textarea[placeholder*="답변"]');
    this.submitButton = page.locator('button:has-text("제출")');
    this.chatMessages = page.locator('[class*="rounded"][class*="p-3"]').filter({ hasText: /.+/ });
    this.viewResultButton = page.locator('a:has-text("결과 보기")');
    this.newInterviewButton = page.locator('button:has-text("새 면접 시작")');
    this.apiKeyInput = page.locator('input[type="password"]');
    this.loginButtons = page.locator('button:has-text("로그인")');
  }

  async goto() {
    await this.page.goto('/interview/chat');
  }

  async waitForSetup() {
    await this.setupSection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async selectInterviewers(count: number = 2) {
    const buttons = await this.interviewerButtons.all();
    // Select first N interviewers
    for (let i = 0; i < Math.min(count, buttons.length); i++) {
      await buttons[i].click();
    }
  }

  async startInterview() {
    await this.startButton.click();
    // Wait for question to appear
    await this.questionDisplay.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async submitAnswer(answer: string) {
    await this.answerInput.fill(answer);
    await this.submitButton.click();
  }

  async waitForAIResponse(timeout: number = 30000) {
    // Wait for loading state to disappear
    await this.page.waitForTimeout(500); // Small delay for state to update
    // Wait for submit button to be enabled again
    await expect(this.submitButton).toBeEnabled({ timeout });
  }

  async getMessageCount(): Promise<number> {
    return await this.chatMessages.count();
  }

  async isInterviewCompleted(): Promise<boolean> {
    return await this.viewResultButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  async goToResult() {
    await this.viewResultButton.click();
  }

  async hasLoginButtons(): Promise<boolean> {
    return await this.loginButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
  }
}

/**
 * Page Object for Interview History page
 */
export class InterviewHistoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly sessionItems: Locator;
  readonly newInterviewButton: Locator;
  readonly filterDropdown: Locator;
  readonly sortDropdown: Locator;
  readonly loginButtons: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h2:has-text("면접 히스토리")');
    this.sessionItems = page.locator('a[href*="/interview/result/"]');
    this.newInterviewButton = page.locator('a:has-text("새 면접")');
    this.filterDropdown = page.locator('select').first();
    this.sortDropdown = page.locator('select').nth(1);
    this.loginButtons = page.locator('button:has-text("로그인")');
    this.emptyState = page.locator('text=아직 면접 기록이 없습니다');
  }

  async goto() {
    await this.page.goto('/interview/history');
  }

  async waitForLoad() {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getSessionCount(): Promise<number> {
    // Wait for either sessions or empty state
    await Promise.race([
      this.sessionItems.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
      this.emptyState.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
    ]);
    return await this.sessionItems.count();
  }

  async clickFirstSession() {
    await this.sessionItems.first().click();
  }

  async hasLoginButtons(): Promise<boolean> {
    return await this.loginButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
  }

  async changeFilter(value: string) {
    await this.filterDropdown.selectOption(value);
  }

  async changeSort(value: string) {
    await this.sortDropdown.selectOption(value);
  }
}

/**
 * Page Object for Interview Result page
 */
export class InterviewResultPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly totalScore: Locator;
  readonly questionDisplay: Locator;
  readonly conversationHistory: Locator;
  readonly historyButton: Locator;
  readonly newInterviewButton: Locator;
  readonly loginButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h2:has-text("면접 결과")');
    this.totalScore = page.locator('text=/\\d+/').filter({ hasText: /^\d+$/ }).first();
    this.questionDisplay = page.locator('.bg-blue-50, .dark\\:bg-blue-900\\/20');
    this.conversationHistory = page.locator('h3:has-text("대화 히스토리")');
    this.historyButton = page.locator('a:has-text("히스토리 목록")');
    this.newInterviewButton = page.locator('a:has-text("새 면접 시작")');
    this.loginButtons = page.locator('button:has-text("로그인")');
  }

  async waitForLoad() {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  async hasScore(): Promise<boolean> {
    return await this.totalScore.isVisible({ timeout: 2000 }).catch(() => false);
  }

  async getScore(): Promise<number> {
    const text = await this.totalScore.textContent();
    return parseInt(text || '0', 10);
  }

  async goToHistory() {
    await this.historyButton.click();
  }

  async startNewInterview() {
    await this.newInterviewButton.click();
  }

  async hasLoginButtons(): Promise<boolean> {
    return await this.loginButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
  }
}
