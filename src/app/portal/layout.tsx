export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // No auth guard — this is the public intern portal
  return <>{children}</>;
}
