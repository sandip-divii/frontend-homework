import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "@/styles/globals.scss";

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Premium Paid Services | Bookplate",
  description:
    "Browse expert publishing services — cover design, internal design, typo inspection and correction.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Pretendard is not on Google Fonts; served from the official jsDelivr build.
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={nanumMyeongjo.variable}>
      <head>
        <link rel="stylesheet" href={PRETENDARD_CSS} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
