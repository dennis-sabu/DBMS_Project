import { Hero9 } from "@/components/ui/hero-9";
import { Navbar } from "@/components/ui/navbar";
import { HomeAbout } from "@/components/ui/home-about";
import { HomeFeatures } from "@/components/ui/home-features";
import { HomeCta } from "@/components/ui/home-cta";
import { HomeFooter } from "@/components/ui/home-footer";

export default function HomePage() {
  return (
    <main className="min-h-screen font-sans text-slate-950 antialiased">
      {/* Shared navbar (fixed). The .hide-hero-nav class on the wrapper
          below hides Hero-9's built-in header so we get a single nav. */}
      <Navbar />
      <div className="hide-hero-nav">
        <Hero9
          eyebrowText="Over 12k notes shared this week"
          title={"The best notes from\nthe smartest minds on campus."}
          description={
            "Upload, share, and discover top-quality study materials\nfrom students across your university."
          }
          uploadText="Upload Notes"
          uploadHref="/upload"
          submitText="Create Account"
          formAction="/signup"
          navItems={[]}
          ctaText=""
          ctaHref=""
        />
      </div>
      <div id="about">
        <HomeAbout />
      </div>
      <HomeFeatures />
      <div id="cta">
        <HomeCta />
      </div>
      <HomeFooter />
    </main>
  );
}
