import { Home, Leaf, Wrench, Info, Mail, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Strains", href: "/strains", icon: Leaf },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
];

export const socialLinks: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/rootedrightfarms" },
];
