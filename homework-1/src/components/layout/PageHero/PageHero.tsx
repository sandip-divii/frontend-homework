import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./PageHero.module.scss";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  breadcrumb: readonly Crumb[];
  title: string;
}

/** "tit_big" frame: soft background, breadcrumb and the serif page title. */
export function PageHero({ breadcrumb, title }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            {breadcrumb.map((crumb, index) => {
              const last = index === breadcrumb.length - 1;
              return (
                <Fragment key={crumb.label}>
                  {index > 0 ? (
                    <li aria-hidden="true" className={styles.arrow}>
                      <Icon name="arrowRight" size={16} />
                    </li>
                  ) : null}
                  <li className={last ? styles.crumbCurrent : styles.crumb}>
                    {crumb.href && !last ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </nav>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  );
}
