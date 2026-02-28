import Link from "next/link";

const socialIcons = [
  {
    label: "Instagram",
    href: "#",
    path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
  },
  {
    label: "Twitter",
    href: "#",
    path: "M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.58-2.11-9.96-5.02-.42.72-.66 1.56-.66 2.46 0 1.68.85 3.16 2.14 4.02-.79-.02-1.53-.24-2.18-.6v.06c0 2.35 1.67 4.31 3.88 4.76-.4.1-.83.16-1.27.16-.31 0-.62-.03-.92-.08.63 1.96 2.45 3.39 4.61 3.43-1.69 1.32-3.83 2.1-6.15 2.1-.4 0-.8-.02-1.19-.07 2.19 1.4 4.78 2.22 7.57 2.22 9.07 0 14.02-7.52 14.02-14.02 0-.21 0-.42-.01-.63.96-.69 1.79-1.56 2.45-2.55z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
  },
];

export default function Footer() {
  return (
    <footer className="w-full pt-20 pb-8 border-t border-[#4A9EAD]/8" style={{ background: "#050509" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div>
            <h3 className="font-black text-lg tracking-[0.25em] uppercase mb-4 text-white">DIGIPARK</h3>
            <p className="text-sm text-[#4a5568] leading-relaxed mb-6">
              Curious about new developments and updates? Follow our social media
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map((icon) => (
                <Link
                  key={icon.label}
                  href={icon.href}
                  aria-label={icon.label}
                  className="w-10 h-10 rounded-full bg-[#08090f] border border-[#4A9EAD]/10 flex items-center justify-center text-[#4a5568] hover:text-[#4A9EAD] hover:border-[#4A9EAD]/40 transition-all duration-300 hover:shadow-[0_0_16px_rgba(74,158,173,0.2)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={icon.path} /></svg>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Address</h4>
            <p className="text-sm text-[#4a5568] leading-relaxed">
              8769 Streets 31 1st floor,<br />Semarang, Indonesia
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Contact Us On</h4>
            <div className="flex flex-col gap-2 text-sm text-[#4a5568]">
              <span>+62453539287</span>
              <span>+62453539287</span>
              <span>Hello@Tasktion.com</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Our Policies</h4>
            <div className="flex flex-col gap-2 text-sm text-[#4a5568]">
              <Link href="#" className="hover:text-[#4A9EAD] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#4A9EAD] transition-colors">Term of Use</Link>
              <Link href="#" className="hover:text-[#4A9EAD] transition-colors">Term of Order</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#4A9EAD]/8 pt-6 text-center text-xs text-[#3a4050]">
          © {new Date().getFullYear()} DIGIPARK. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
