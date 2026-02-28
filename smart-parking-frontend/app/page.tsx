import CTASection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/Hero";
import MapSection from "@/components/landing/MapSection";
import Navbar from "@/components/landing/NavBar";
import StatsSection from "@/components/landing/StarSection";
import TestimonialsSection from "@/components/landing/Testimonial";


export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <MapSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}