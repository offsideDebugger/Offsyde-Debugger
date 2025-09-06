import axios from 'axios';
import * as cheerio from 'cheerio';

export async function extractLinksCheerio(url: string): Promise<{ title: string; routes: string[] }> {
  try {
    console.log('Fetching URL:', url);
    
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkCrawler/1.0)'
      }
    });
    
    const $ = cheerio.load(response.data as string);
    
    // Get page title
    const title = $('title').text() || 'No title found';
    console.log('Page loaded successfully');
    console.log('Title:', title);
    
    const links = $('a[href]').map((i, el) => {
      let href = $(el).attr('href');
      if (!href) return null;
      
      try {
        
        if (href.startsWith('/')) {
          href = new URL(href, url).toString();
        } else if (!href.startsWith('http')) {
          href = new URL(href, url).toString();
        }
        
        return href;
      } catch {
        return null;
      }
    }).get().filter(Boolean);
    
   
    const uniqueLinks = [...new Set(links)];
    
    const socials=["facebook.com","twitter.com","instagram.com","linkedin.com","youtube.com","pinterest.com","tiktok.com","reddit.com","tumblr.com","flickr.com","wa.me","api.whatsapp.com","chat.whatsapp.com","discord.com","discord.gg","medium.com","github.com","gitlab.com","bitbucket.org","x.com"]
    
    const sameOriginLinks = uniqueLinks.filter(link  => {
      return !socials.some(social => link.includes(social));
    })
    
    console.log(`Found ${uniqueLinks.length} total links, ${sameOriginLinks.length} same-origin`);
    
    return { title, routes: sameOriginLinks };
    
  } catch (error) {
    console.error('Error fetching page:', error);
    return { title: 'Error loading page', routes: [] };
  }
}