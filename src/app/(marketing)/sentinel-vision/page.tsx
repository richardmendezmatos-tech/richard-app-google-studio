import { SentinelVisionScanner } from '@/features/sentinel-vision/ui/SentinelVisionScanner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sentinel Neural Vision | Richard Automotive',
  description:
    'Military-grade AI automotive scanner. Analyze your vehicle with neural vision technology.',
};

export default function SentinelVisionPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-bg-elite absolute top-0 left-0 w-full h-full opacity-20" />
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-ra-primary/10 rounded-full blur-[120px] animate-neural-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-ra-accent/5 rounded-full blur-[120px] animate-spin-slow" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <SentinelVisionScanner />

        {/* Why this is viral section */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-ra-primary/10 flex items-center justify-center border border-ra-primary/20">
              <span className="text-ra-primary font-bold">01</span>
            </div>
            <h4 className="text-xl font-bold text-white uppercase tracking-tighter-caps">
              Neural Decoding
            </h4>
            <p className="text-text-muted text-sm leading-relaxed">
              Our advanced AI architecture identifies over 2,000 vehicle parameters from a single
              high-resolution capture.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-ra-accent/10 flex items-center justify-center border border-ra-accent/20">
              <span className="text-ra-accent font-bold">02</span>
            </div>
            <h4 className="text-xl font-bold text-white uppercase tracking-tighter-caps">
              Market Pulse Integration
            </h4>
            <p className="text-text-muted text-sm leading-relaxed">
              Real-time cross-referencing with global auction data and local market inventory for
              precision valuation.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
              <span className="text-white font-bold">03</span>
            </div>
            <h4 className="text-xl font-bold text-white uppercase tracking-tighter-caps">
              Sentinel Verification
            </h4>
            <p className="text-text-muted text-sm leading-relaxed">
              Every scan is cryptographically signed and verified by the Richard Automotive Command
              Center.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
