import { request } from '@playwright/test';
import { API } from './tests/helpers';

/** Seed the local RealWorld backend with demo content: 12 tagged articles (> one home page) by `conduitdemo`. */
export default async function globalSetup() {
  const ctx = await request.newContext();
  const existing = await (await ctx.get(`${API}/articles?author=conduitdemo&limit=1`)).json();
  if (existing.articlesCount >= 12) return;

  const user = {
    username: 'conduitdemo',
    email: 'conduitdemo@example.com',
    password: 'Passw0rd!123',
  };
  let res = await ctx.post(`${API}/users/login`, { data: { user } });
  if (!res.ok()) res = await ctx.post(`${API}/users`, { data: { user } });
  if (!res.ok()) throw new Error(`seed user: ${res.status()} ${await res.text()}`);
  const token = (await res.json()).user.token;

  const tags = ['angular', 'migration', 'testing', 'signals'];
  for (let i = existing.articlesCount + 1; i <= 12; i++) {
    const r = await ctx.post(`${API}/articles`, {
      headers: { Authorization: `Token ${token}` },
      data: {
        article: {
          title: `Demo article ${i}`,
          description: `Seeded demo article number ${i}`,
          body: `## Demo ${i}\n\nThis is **seeded** content for the E2E suite.`,
          tagList: [tags[i % tags.length], tags[(i + 1) % tags.length]],
        },
      },
    });
    if (!r.ok()) throw new Error(`seed article ${i}: ${r.status()} ${await r.text()}`);
  }
  await ctx.dispose();
}
