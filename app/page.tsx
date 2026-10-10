"use client";

import { useEffect, useState } from "react";
import { Hero9 } from "@/components/ui/hero-9";
import { Navbar } from "@/components/ui/navbar";
import { HomeAbout } from "@/components/ui/home-about";
import { HomeFeatures } from "@/components/ui/home-features";
import { HomeCta } from "@/components/ui/home-cta";
import { HomeFooter } from "@/components/ui/home-footer";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setIsLoggedIn(!!session?.user)
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen font-sans text-slate-950 antialiased">
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
          submitText={isLoggedIn ? "Browse Notes" : "Create Account"}
          formAction={isLoggedIn ? "/browse" : "/signup"}
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
