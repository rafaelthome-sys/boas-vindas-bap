import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boas Vindas BAP",
  description: "Sistema de geração de relatórios para novos síndicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
