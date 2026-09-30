// ============================================================
// RepoPulse — GitHub Token Pool (Rate-Limit Rotation Engine)
// ============================================================

import { ENV } from '../config/env.js';

class GitHubTokenPool {
  private tokens: string[] = [];
  private currentIndex = 0;

  constructor() {
    this.refreshTokens();
  }

  public refreshTokens() {
    const raw = ENV.GITHUB_TOKEN_POOL || process.env.GITHUB_TOKEN || '';
    this.tokens = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (this.tokens.length > 0) {
      console.log(`🔑 [GitHub Token Pool] Loaded ${this.tokens.length} token(s) for rate-limit rotation.`);
    } else {
      console.warn('⚠️ [GitHub Token Pool] No GITHUB_TOKEN_POOL configured. Using public unauthenticated rate-limit (60 req/hr).');
    }
  }

  public getNextToken(): string | undefined {
    if (this.tokens.length === 0) return undefined;
    const token = this.tokens[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;
    return token;
  }

  public getPoolSize(): number {
    return this.tokens.length;
  }
}

export const tokenPool = new GitHubTokenPool();
