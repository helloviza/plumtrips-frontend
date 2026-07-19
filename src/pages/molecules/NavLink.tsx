import { Link } from 'wouter';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
}

export function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link href={href} className={cn(
      "relative px-1 py-4 text-sm font-medium transition-colors hover:text-orange-500",
      active ? "text-orange-500" : "text-slate-600"
    )}>
      {label}
      {active && (
        <motion.div
          layoutId="navbar-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
        />
      )}
    </Link>
  );
}
