const { chromium } = require('C:/Users/alyde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const {pathToFileURL, fileURLToPath} = require('url');
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
 const page = await browser.newPage({reducedMotion:'reduce'});
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 const files = ['index.html', ...fs.readdirSync('projects').filter(x=>x.endsWith('.html')).map(x=>'projects/'+x)];
 let count=0;
 for(const language of ['', 'en/']) {
  for(const file of files) {
   const absolute=path.resolve(language+file);
   await page.setViewportSize({width:1366,height:900});
   await page.goto(pathToFileURL(absolute).href);
   const info=await page.evaluate(()=>({lang:document.documentElement.lang, switchCount:document.querySelectorAll('.language-switch').length, links:[...document.querySelectorAll('[href],[src]')].map(e=>e.href?.baseVal??e.href??e.src).filter(x=>typeof x==='string'&&x.startsWith('file:')), brokenImages:[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>x.src)}));
   if(info.lang!==(language?'en':'fr')||info.switchCount!==1||info.brokenImages.length) throw Error(JSON.stringify({file,info}));
   for(const link of info.links) {const u=new URL(link);if(!fs.existsSync(fileURLToPath(u)))throw Error('Broken link '+link);}
   for(const width of [1366, 820, 390, 320]) {
    await page.setViewportSize({width,height:900});
    const layout=await page.evaluate(()=>{const a=document.querySelector('.language-switch').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1, switchVisible:a.x>=0&&a.right<=innerWidth&&a.height>=35};});
    if(layout.overflow||!layout.switchVisible) throw Error(JSON.stringify({file:language+file,width,layout}));
   }
   const switchTo=await page.locator('.language-switch').getAttribute('href');
   await page.locator('.language-switch').click();
   if(await page.locator('html').getAttribute('lang')!==(language?'fr':'en'))throw Error('Switch failed '+switchTo);
   count++;
  }
 }
 await page.setViewportSize({width:1366,height:900});
 await page.goto(pathToFileURL(path.resolve('en/index.html')).href+'#projets');
 if(!(await page.locator('.language-switch').getAttribute('href')).endsWith('#projets'))throw Error('Anchor lost');
 await page.locator('.filter[data-filter="cyber"]').click();
 const visible = await page.locator('.project-card:not(.is-hidden)').count();
 if(!visible||visible===9)throw Error('Filter failed');
 await page.goto(pathToFileURL(path.resolve('en/index.html')).href);
 await page.screenshot({path:'.build/english-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'.build/english-mobile.png'});
 await page.locator('#navToggle').click();
 if(await page.locator('#navToggle').getAttribute('aria-expanded')!=='true')throw Error('Menu failed');
 if(errors.length)throw Error(errors.join('\n'));
 console.log(`${count} pages checked: links, images, language switching, desktop/mobile layout; English filters, menu and section anchors OK.`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

