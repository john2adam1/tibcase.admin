import "./globals.css";

export const metadata = {
  title: "TibCase Admin — TibSphere AI Medical Simulation Platform",
  description: "Boshqaruv paneli: Klinik keyslar, AI simulyatsiya, tibbiy kategoriyalar va moliya monitoringi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
