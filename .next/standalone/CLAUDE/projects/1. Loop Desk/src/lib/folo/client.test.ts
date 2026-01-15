/**
 * Tests for FoloClient
 *
 * Run with: npx vitest run src/lib/folo/client.test.ts
 */

import { describe, expect, it } from 'vitest';
import { FoloClient } from './client';

describe('FoloClient', () => {
  const client = new FoloClient();

  describe('parseListUrl', () => {
    it('should parse share list URLs', () => {
      expect(
        client.parseListUrl('https://app.folo.is/share/lists/230942183743771648')
      ).toBe('230942183743771648');

      expect(
        client.parseListUrl('https://folo.is/share/lists/123456789')
      ).toBe('123456789');

      expect(
        client.parseListUrl('http://app.folo.is/share/lists/999/')
      ).toBe('999');
    });

    it('should parse direct list IDs', () => {
      expect(client.parseListUrl('230942183743771648')).toBe('230942183743771648');
      expect(client.parseListUrl('123')).toBe('123');
      expect(client.parseListUrl('  456  ')).toBe('456');
    });

    it('should return null for invalid URLs', () => {
      expect(client.parseListUrl('https://example.com')).toBeNull();
      expect(client.parseListUrl('not-a-number')).toBeNull();
      expect(client.parseListUrl('')).toBeNull();
      expect(client.parseListUrl('https://app.folo.is/other/path')).toBeNull();
    });
  });

  describe('parseUrl', () => {
    it('should return structured info for valid URLs', () => {
      const result = client.parseUrl('https://app.folo.is/share/lists/123');
      expect(result).toEqual({ listId: '123', type: 'list' });
    });

    it('should return null for invalid URLs', () => {
      expect(client.parseUrl('invalid')).toBeNull();
    });
  });

  describe('fetchList', () => {
    it('should fetch a real list from the API', async () => {
      const list = await client.fetchList('230942183743771648');

      expect(list).toBeDefined();
      expect(list.id).toBe('230942183743771648');
      expect(list.title).toBeDefined();
      expect(Array.isArray(list.feeds)).toBe(true);
      expect(list.feeds.length).toBeGreaterThan(0);
      expect(list.owner).toBeDefined();
      expect(list.owner.name).toBeDefined();
    }, 15000);

    it('should have feeds with expected structure', async () => {
      const list = await client.fetchList('230942183743771648');
      const feed = list.feeds[0];

      expect(feed.id).toBeDefined();
      expect(feed.url).toBeDefined();
      expect(feed.title).toBeDefined();
      expect(typeof feed.siteUrl).toBe('string');
    }, 15000);
  });

  describe('fetchListFeeds', () => {
    it('should return only feeds', async () => {
      const feeds = await client.fetchListFeeds('230942183743771648');

      expect(Array.isArray(feeds)).toBe(true);
      expect(feeds.length).toBeGreaterThan(0);
      feeds.forEach((feed) => {
        expect(feed.id).toBeDefined();
        expect(feed.url).toBeDefined();
      });
    }, 15000);
  });

  describe('fetchListEntries', () => {
    it('should return entries with feed info', async () => {
      const entries = await client.fetchListEntries('230942183743771648');

      expect(Array.isArray(entries)).toBe(true);
      if (entries.length > 0) {
        const entry = entries[0];
        expect(entry.id).toBeDefined();
        expect(entry.title).toBeDefined();
        expect(entry.url).toBeDefined();
        expect(entry.feeds).toBeDefined();
        expect(entry.feeds.title).toBeDefined();
      }
    }, 15000);
  });

  describe('fetchListData', () => {
    it('should return complete list data', async () => {
      const data = await client.fetchListData('230942183743771648');

      expect(data.list).toBeDefined();
      expect(data.subscriptionCount).toBeGreaterThanOrEqual(0);
      expect(data.readCount).toBeGreaterThanOrEqual(0);
      expect(data.feedCount).toBeGreaterThan(0);
      expect(Array.isArray(data.entries)).toBe(true);
    }, 15000);
  });

  describe('error handling', () => {
    it('should throw on invalid list ID', async () => {
      const client = new FoloClient({ retries: 0 });
      await expect(client.fetchList('999999999999999999')).rejects.toThrow();
    }, 15000);
  });

  describe('configuration', () => {
    it('should accept custom configuration', () => {
      const customClient = new FoloClient({
        baseUrl: 'https://custom.api.folo.is',
        timeout: 5000,
        retries: 1,
        retryDelay: 500,
        userAgent: 'CustomAgent/1.0',
      });

      expect(customClient).toBeDefined();
    });
  });
});
