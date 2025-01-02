import './globals.css';

export const metadata = {
  title: 'Nepa GRL Management Meeting',
  description: 'Board management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}