import { Icon, type IconName } from "@/components/ui/Icon/Icon";
import { Logo } from "@/components/ui/Logo/Logo";
import styles from "./Footer.module.scss";

// Copy taken verbatim from the Figma "pc_1920_gnb_푸터" instance.
const INFO_LINES: readonly string[] = [
  "Customer Center 02|6409-0878 | Siwonschool Tab A/S Center 02-6409-0878 | Corporate Education Consulting and Teaching 02-2014-8254 | FAX 02|6406-1309",
  "Terms of Use | Privacy Policy SJ Double U International Co., Ltd. | Customer Center: siwoncs@siwonschool.com | Marketing/Partnership Inquiries: marketer@siwonschool.com",
  "Proposal and Chief Responsibility Officer for Customers (Business): ceo@siwonschool.com | Business Registration Number: 214-87-98782 | Mail Order Sales Registration Number: 2016-Seoul Yeongdeungpo-1275 [Information Search]",
  "Remote Lifelong Education Facility Registration Number: South Education Support Center-691 | Hosting Provider: KT Co., Ltd.",
  "166 Yeongsin-ro, Yeongdeungpo-gu, Seoul, Yeongdeungpo Peninsula Ivy Valley 7th and 8th floors | Representative: Yang Hong-Geol | Personal Information Protection Manager: Choi Kwang-Cheol",
];

const SOCIAL: ReadonlyArray<{ icon: IconName; label: string; href: string }> = [
  { icon: "instagram", label: "Instagram", href: "#" },
  { icon: "play", label: "YouTube", href: "#" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Logo />
          <ul className={styles.social} aria-label="Social media">
            {SOCIAL.map((s) => (
              <li key={s.icon}>
                <a href={s.href} className={styles["social-link"]} aria-label={s.label}>
                  <Icon name={s.icon} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ul className={styles.info}>
          {INFO_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className={styles.copyright}>Copyright © 2024 siwonschool. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
