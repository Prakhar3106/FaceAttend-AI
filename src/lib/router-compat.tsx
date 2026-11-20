import React from 'react';
import {
  useLocation as useTsLocation,
  useNavigate as useTsNavigate,
  useParams as useTsParams,
} from '@tanstack/react-router';

/**
 * Small adapter so the original FaceAttend pages keep their string-path navigation
 * (navigate('/admin/dashboard')) on top of TanStack Router.
 */
export function useNavigate() {
  const navigate = useTsNavigate();
  return React.useCallback(
    (href: string, opts?: { replace?: boolean }) => navigate({ href, replace: opts?.replace }),
    [navigate]
  );
}

export function useLocation() {
  return useTsLocation();
}

export function useParams<T extends Record<string, string | undefined>>(): T {
  return useTsParams({ strict: false } as never) as T;
}

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
};

type NavLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

export const NavLink: React.FC<NavLinkProps> = ({ to, onClick, children, ...rest }) => {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      {...rest}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};
