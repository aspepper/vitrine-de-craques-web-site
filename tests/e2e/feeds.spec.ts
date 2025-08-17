import { test, expect } from '@playwright/test';

test.describe('Video Feed', () => {
  test('should autoplay video on viewport and pause when out of view', async ({ page }) => {
    await page.goto('/feeds');

    // Wait for the first video to be visible and potentially start playing
    const firstVideo = page.locator('video').first();
    await expect(firstVideo).toBeVisible();

    // Give it a moment to ensure autoplay starts
    await page.waitForTimeout(1000);

    // Check if the first video is playing
    let isPlaying = await firstVideo.evaluate(video => !video.paused);
    expect(isPlaying).toBe(true);

    // Scroll to the second video
    const secondVideo = page.locator('video').nth(1);
    await secondVideo.scrollIntoViewIfNeeded();
    
    // Give it a moment for the IntersectionObserver to trigger
    await page.waitForTimeout(1000);

    // Check if the first video is paused
    isPlaying = await firstVideo.evaluate(video => !video.paused);
    expect(isPlaying).toBe(false);

    // Check if the second video is playing
    isPlaying = await secondVideo.evaluate(video => !video.paused);
    expect(isPlaying).toBe(true);
  });
});
