import { LogoMarkIcon } from "./icons.jsx";
import "./AuthLayout.css";

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <span className="auth-card__mark">
          <LogoMarkIcon />
        </span>

        <div className="auth-card__head">
          {eyebrow && <span className="auth-card__eyebrow">{eyebrow}</span>}
          <h1 className="auth-card__title">{title}</h1>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
        </div>

        <div className="auth-card__form">{children}</div>

        {footer && <div className="auth-card__footer">{footer}</div>}
      </div>
    </div>
  );
}
