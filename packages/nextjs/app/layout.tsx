import { Pixelify_Sans } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "nes.css/css/nes.min.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-pixelify-sans",
});

export const metadata = getMetadata({
  title: "BitBrawlers",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={`${pixelifySans.variable}`}>
      <body className={pixelifySans.className}>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
