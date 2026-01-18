import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  children: React.ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, children, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            "relative px-4 py-2 transition-all duration-300 ease-out flex items-center gap-2 font-black uppercase tracking-widest text-[11px]",
            "hover:text-gold group",
            isActive ? "text-gold" : "text-white/40",
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        {...props}
      >
        {({ isActive }) => (
          <>
            {/* النص البرمجي للرابط */}
            <span className="relative z-10">{children}</span>

            {/* مؤشر الحالة النشطة (تأثير ذهبي سفلي) */}
            {isActive && (
              <motion.div
                layoutId="nav-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* تأثير الإضاءة الخلفية عند التحويم */}
            <div className="absolute inset-0 rounded-lg bg-gold/5 scale-0 group-hover:scale-100 transition-transform duration-300 -z-0" />
          </>
        )}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
