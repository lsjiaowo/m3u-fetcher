const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to the URL...');
    // 設定較長的超時時間，給予 Cloudflare 驗證足夠的時間
    await page.goto('https://tv.iill.top/m3u/Gather', { timeout: 120000 });
    
    console.log('Waiting for the page to load and pass challenges...');
    // 等待頁面內容載入完成
    await page.waitForLoadState('domcontentloaded');
    
    // 獲取最終的頁面內容
    const content = await page.content();
    
    // 簡單檢查內容是否為 M3U 格式，而不是 Cloudflare 頁面
    if (content.trim().startsWith('#EXTM3U')) {
      console.log('Successfully fetched M3U content.');
      fs.writeFileSync('YanG.m3u', content);
    } else {
      console.error('Failed to get M3U content. The page content is still not the expected format.');
      // 為了偵錯，我們把抓到的內容也印出來
      console.log('--- Page Content Start ---');
      console.log(content);
      console.log('--- Page Content End ---');
      throw new Error('Content is not in M3U format.');
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1); // 讓 GitHub Actions 知道這個步驟失敗了
  } finally {
    await browser.close();
  }
})();
