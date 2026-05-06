export const metadata = { title: 'DClaw Water', description: 'Water management' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
