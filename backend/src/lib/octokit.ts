// ============================================================
// RepoPulse — GitHub API Client (REST & GraphQL)
// ============================================================

import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { tokenPool } from './token-pool.js';

export function getOctokitClient(): Octokit {
  const token = tokenPool.getNextToken();
  return new Octokit({
    auth: token,
    userAgent: 'RepoPulse-HackQubit-v1',
  });
}

export function getGraphQLClient() {
  const token = tokenPool.getNextToken();
  return graphql.defaults({
    headers: {
      authorization: token ? `bearer ${token}` : undefined,
      'user-agent': 'RepoPulse-HackQubit-v1',
    },
  });
}
