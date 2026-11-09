import {
  Dribbble,
  Github,
  Globe,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export const socialIcons: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  globe: Globe,
  x: Twitter,
  youtube: Youtube,
  link: Link2,
  dribbble: Dribbble,
  discord: MessageCircle,
};

export function SocialIcon({ name, className }: { name: string; className?: string }) {
  const Icon = socialIcons[name] ?? Link2;
  return <Icon className={className} strokeWidth={1.5} />;
}
