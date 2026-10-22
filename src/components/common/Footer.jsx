import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" to="/home">
            <span className="brand-mark" aria-hidden="true">
              hh
            </span>
            <span className="brand-name">
              HUNGRY <b>HOUR</b>
            </span>
          </Link>
          <p>
            Good food brings us together.
            <br />
            Let&apos;s make room for one more bite.
          </p>
        </div>
        <div className="footer-column">
          <h2>Explore</h2>
          <a href="#restaurants">Restaurants</a>
          <a href="#offers">Offers</a>
          <a href="#popular-dishes">Popular dishes</a>
        </div>
        <div className="footer-column">
          <h2>Hungry Hour</h2>
          <a href="#help">How it works</a>
          <Link to="/login">Your account</Link>
          <a href="mailto:hello@hungryhour.in">Contact us</a>
        </div>
        <div className="footer-note">
          <span aria-hidden="true">✳</span>
          <p>Good food. Good mood. Good company.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 HUNGRY HOUR</span>
        <span>Made with a little extra love.</span>
      </div>
    </footer>
  );
}