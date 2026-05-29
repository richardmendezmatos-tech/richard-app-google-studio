import { ImageResponse } from 'next/og';
import { getCarById } from '@/entities/inventory/api/adapters/inventoryService';
import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';
import { blogService } from '@/entities/blog/api/blogService';
import { BlogPost } from '@/shared/types/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    // Blog article OG image
    if (slug) {
      const allSeeds = SEED_ARTICLES as BlogPost[];
      let article = allSeeds.find((a) => a.slug === slug) || null;

      if (!article) {
        try {
          const dynamic = await blogService.getBlogPosts(100);
          article = dynamic.find((a) => a.slug === slug) || null;
        } catch {
          // not found
        }
      }

      if (!article) {
        return new Response('Article not found', { status: 404 });
      }

      const title = article.title;
      const excerpt = article.metaDescription || article.excerpt;
      const author = article.author;
      const date = new Date(article.date).toLocaleDateString('es-PR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#020617',
              backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)',
              fontFamily: 'sans-serif',
              color: 'white',
              padding: '60px',
            }}
          >
            {/* Top Header */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#00e5ff', letterSpacing: '0.1em' }}>RICHARD</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.3em' }}>AUTOMOTIVE</span>
              </div>
              <div style={{ backgroundColor: '#00e5ff', color: '#020617', padding: '8px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: '900' }}>
                BLOG
              </div>
            </div>

            {/* Article Info */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', maxWidth: '900px' }}>
              <h1 style={{ fontSize: '56px', fontWeight: '900', lineHeight: 1.1, margin: 0, marginBottom: '20px' }}>
                {title}
              </h1>
              <p style={{ fontSize: '22px', color: '#94a3b8', lineHeight: 1.4, margin: 0, marginBottom: '30px' }}>
                {excerpt.length > 120 ? excerpt.slice(0, 120) + '...' : excerpt}
              </p>
              <div style={{ display: 'flex', gap: '20px', fontSize: '16px', color: '#64748b' }}>
                <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{author}</span>
                <span>•</span>
                <span>{date}</span>
              </div>
            </div>

            {/* Bottom */}
            <div style={{ display: 'flex', width: '100%', borderTop: '1px solid #1e293b', paddingTop: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>BONO DE $300 WEB ACTIVO</span>
              </div>
              <span style={{ fontSize: '14px', color: '#64748b' }}>richard-automotive.com/blog</span>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
    }

    // Vehicle OG image (existing)
    if (!id) {
      return new Response('Missing car ID or blog slug', { status: 400 });
    }

    const car = await getCarById(id);

    if (!car) {
      return new Response('Car not found', { status: 404 });
    }

    const price = Number(car.price) || 0;
    const monthly = Math.round((price - 2000) * (0.085 / 12) / (1 - Math.pow(1 + 0.085 / 12, -72)));
    const carImage = car.images?.[0] || car.image || car.img || 'https://richard-automotive.com/placeholder-car.webp';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617',
            backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)',
            fontFamily: 'sans-serif',
            color: 'white',
            padding: '40px',
          }}
        >
          {/* Top Header */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#00e5ff', letterSpacing: '0.1em' }}>RICHARD</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.3em' }}>AUTOMOTIVE</span>
            </div>
            <div style={{ backgroundColor: '#00e5ff', color: '#020617', padding: '8px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: '900' }}>
              BONO DE $300 WEB ACTIVO
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', flex: 1, alignItems: 'center' }}>
            {/* Info Section */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '40px' }}>
              <span style={{ fontSize: '20px', color: '#00e5ff', fontWeight: 'bold', marginBottom: '10px' }}>{car.year} • {car.type?.toUpperCase()}</span>
              <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: 1, margin: 0, marginBottom: '20px', textTransform: 'uppercase' }}>{car.name}</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold' }}>${price.toLocaleString()}</span>
                <span style={{ fontSize: '24px', color: '#00e5ff', fontWeight: 'bold' }}>Desde ${monthly.toLocaleString()}/mes</span>
              </div>
            </div>

            {/* Image Section */}
            <div style={{ display: 'flex', width: '500px', height: '350px', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <img
                src={carImage}
                alt={car.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Bottom Footer */}
          <div style={{ display: 'flex', width: '100%', borderTop: '1px solid #1e293b', paddingTop: '20px', marginTop: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '10px' }} />
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>DISPONIBILIDAD INMEDIATA • PUERTO RICO</span>
            </div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>richard-automotive.com</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.error('OG Image Generation Error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
