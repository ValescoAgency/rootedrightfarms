import { TopNav } from "@/components/nav/top-nav";
import { FloatingPillNav } from "@/components/nav/floating-pill-nav";
import { Footer } from "@/components/footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <TopNav />
      <main id="main">{children}</main>
      <Footer />
      <FloatingPillNav />
    </>
  );
}
