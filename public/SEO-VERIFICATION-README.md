# SEO Verification Files

This directory contains verification files for search engines and webmaster tools.

## Google Search Console

To verify your site with Google Search Console:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://www.richard-automotive.com`
3. Choose "HTML file" verification method
4. Download the verification file (e.g., `google1234567890abcdef.html`)
5. Place it in this directory (`public/`)
6. Deploy to Vercel
7. Click "Verify" in Google Search Console

## Bing Webmaster Tools

To verify with Bing:

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `https://www.richard-automotive.com`
3. Choose "HTML file" verification method
4. Download the verification file (e.g., `BingSiteAuth.xml`)
5. Place it in this directory (`public/`)
6. Deploy to Vercel
7. Click "Verify" in Bing Webmaster Tools

## Verification Files

Place your verification files here:
- `google*.html` - Google Search Console
- `BingSiteAuth.xml` - Bing Webmaster Tools
- `yandex_*.html` - Yandex Webmaster (if needed)

These files will be automatically served at the root of your domain.
