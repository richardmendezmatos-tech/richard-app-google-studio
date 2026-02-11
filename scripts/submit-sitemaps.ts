import { SITE_CONFIG } from '../src/constants/siteConfig';

type EngineResult = {
  engine: 'google' | 'bing';
  ok: boolean;
  message: string;
};

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const normalizeSiteUrl = (value: string) => value.replace(/\/$/, '');
const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const baseSiteUrl = normalizeSiteUrl(process.env.SITE_URL || SITE_CONFIG.url);
const siteUrl = normalizeSiteUrl(process.argv[2] || baseSiteUrl);
const sitemapUrl = process.argv[3] || process.env.SITEMAP_URL || `${siteUrl}/sitemap.xml`;

const submitGoogleSitemap = async (): Promise<EngineResult> => {
  const accessToken = process.env.GSC_ACCESS_TOKEN;
  if (!accessToken) {
    return {
      engine: 'google',
      ok: false,
      message: 'Skipped: define GSC_ACCESS_TOKEN.'
    };
  }

  const gscSiteUrl = ensureTrailingSlash(process.env.GSC_SITE_URL || siteUrl);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscSiteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      engine: 'google',
      ok: false,
      message: `HTTP ${response.status}: ${body.slice(0, 400)}`
    };
  }

  return {
    engine: 'google',
    ok: true,
    message: `Submitted ${sitemapUrl} for property ${gscSiteUrl}`
  };
};

const submitBingSitemap = async (): Promise<EngineResult> => {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  if (!apiKey) {
    return {
      engine: 'bing',
      ok: false,
      message: 'Skipped: define BING_WEBMASTER_API_KEY.'
    };
  }

  const bingSiteUrl = ensureTrailingSlash(process.env.BING_SITE_URL || siteUrl);
  const endpoint = `https://ssl.bing.com/webmasterapi/api.svc/soap?apikey=${encodeURIComponent(apiKey)}`;

  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <SubmitFeed xmlns="http://schemas.datacontract.org/2004/07/Microsoft.Bing.Webmaster.Api">
      <siteUrl>${xmlEscape(bingSiteUrl)}</siteUrl>
      <feedUrl>${xmlEscape(sitemapUrl)}</feedUrl>
    </SubmitFeed>
  </s:Body>
</s:Envelope>`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://schemas.datacontract.org/2004/07/Microsoft.Bing.Webmaster.Api/IWebmasterApi/SubmitFeed'
    },
    body: envelope
  });

  const body = await response.text();
  const hasSoapFault = /<\w*:Fault\b/i.test(body);
  if (!response.ok || hasSoapFault) {
    return {
      engine: 'bing',
      ok: false,
      message: `HTTP ${response.status}: ${body.slice(0, 400)}`
    };
  }

  return {
    engine: 'bing',
    ok: true,
    message: `Submitted ${sitemapUrl} for site ${bingSiteUrl}`
  };
};

const run = async () => {
  console.log(`[sitemap-submit] site=${siteUrl}`);
  console.log(`[sitemap-submit] sitemap=${sitemapUrl}`);

  const results: EngineResult[] = await Promise.all([
    submitGoogleSitemap(),
    submitBingSitemap()
  ]);

  let attempted = 0;
  let failed = 0;

  for (const result of results) {
    const skipped = result.message.startsWith('Skipped:');
    if (!skipped) attempted += 1;
    if (!result.ok && !skipped) failed += 1;

    const icon = result.ok ? 'OK' : skipped ? '--' : 'ERR';
    console.log(`[${icon}] ${result.engine}: ${result.message}`);
  }

  if (attempted === 0) {
    console.error(
      '[sitemap-submit] No engines configured. Set GSC_ACCESS_TOKEN and/or BING_WEBMASTER_API_KEY.'
    );
    process.exit(1);
  }

  if (failed > 0) {
    process.exit(1);
  }

  console.log('[sitemap-submit] Completed successfully.');
};

run().catch((error) => {
  console.error('[sitemap-submit] Failed:', error);
  process.exit(1);
});
