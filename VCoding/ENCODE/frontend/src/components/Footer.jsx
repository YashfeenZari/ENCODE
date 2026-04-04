import { Link } from 'react-router-dom'
import { IconGitHub, IconTwitter, IconLinkedIn } from './Icons'
import styles from './Footer.module.css'

const productLinks = [
  { to: '/academy', label: 'Courses' },
  { to: '/academy#paths', label: 'Learning Paths' },
  { to: '/academy#progress', label: 'Progress Tracking' },
]

const resourceLinks = [
  { to: '/docs', label: 'Documentation' },
  { to: '/blog', label: 'Blog' },
  { to: '/community', label: 'Community' },
]

const companyLinks = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { href: 'https://github.com', label: 'GitHub', external: true },
]

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
]

const socialLinks = [
  { href: 'https://github.com', label: 'GitHub', Icon: IconGitHub },
  { href: 'https://twitter.com', label: 'Twitter', Icon: IconTwitter },
  { href: 'https://www.linkedin.com/in/yashfeen-zari-6b6b1722b', label: 'LinkedIn', Icon: IconLinkedIn },
]

function LinkColumn({ title, links }) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>{title}</h4>
      <ul className={styles.linkList}>
        {links.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noreferrer" className={styles.footerLink}>
                {item.label}
              </a>
            ) : (
              <Link to={item.to} className={styles.footerLink}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon} aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
              </svg>
            </span>
            <span className={styles.logoText}>
              <span className={styles.logoEn}>EN</span>
              <span className={styles.logoCode}>CODE</span>
            </span>
          </Link>
          <p className={styles.description}>
            A structured learning platform for serious learners. Master industry-ready skills with guided paths and smart progress tracking.
          </p>
          <p className={styles.signature}>Built with love by Yashfeen Makbul Zari</p>
          <div className={styles.social}>
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div className={styles.columns}>
          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />
          <LinkColumn title="Company" links={companyLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
        </div>
      </div>
    </footer>
  )
}
