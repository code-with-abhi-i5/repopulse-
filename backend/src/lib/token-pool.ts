// ============================================================
// RepoPulse — GitHub Token Pool (Rate-Limit Rotation Engine)
// ============================================================

import { ENV } from '../config/env.js';

class GitHubTokenPool {
  private tokens: string[] = [];
  private blockedTokens: Set<string> = new Set();
  private currentIndex = 0;

  constructor() {
    this.refreshTokens();
    this.verifyTokensBackground();
  }

  public refreshTokens() {
    const raw = ENV.GITHUB_TOKEN_POOL || process.env.GITHUB_TOKEN_POOL || process.env.GITHUB_TOKEN || '';
    this.tokens = raw
      .split(',')
      .map((t) => t.replace(/['"]/g, '').trim())
      .filter((t) => t.length > 0);

    if (this.tokens.length > 0) {
      console.log(`🔑 [GitHub Token Pool] Loaded ${this.tokens.length} token(s) for rate-limit rotation.`);
    } else {
      console.warn('⚠️ [GitHub Token Pool] No GITHUB_TOKEN_POOL configured. Using public unauthenticated rate-limit (60 req/hr).');
    }
  }

  public markTokenBlocked(token: string) {
    if (token && !this.blockedTokens.has(token)) {
      this.blockedTokens.add(token);
      console.warn(`⚠️ [GitHub Token Pool] Token ${token.slice(0, 8)}... marked as blocked/rate-limited. Quarantined. Active capacity: ${this.getActiveTokens().length} token(s).`);
    }
  }

  private getActiveTokens(): string[] {
    return this.tokens.filter((t) => !this.blockedTokens.has(t));
  }

  public getNextToken(): string | undefined {
    const active = this.getActiveTokens();
    if (active.length === 0) return undefined;
    const token = active[this.currentIndex % active.length];
    this.currentIndex = (this.currentIndex + 1) % active.length;
    return token;
  }

  public getPoolSize(): number {
    return this.getActiveTokens().length;
  }

  private async verifyTokensBackground() {
    for (const t of this.tokens) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${t}`,
            'User-Agent': 'RepoPulse-Token-Validator',
          },
        });
        const data: any = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data?.message?.includes('rate limit exceeded') || data?.message?.includes('Bad credentials') || res.status === 401 || res.status === 403) {
            this.markTokenBlocked(t);
          }
        }
      } catch {
        // Network timeout / ignore
      }
    }
  }
}

export const tokenPool = new GitHubTokenPool();
