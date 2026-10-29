import footerImage from "../../assets/images/footer.svg";

export default function Footer() {
  return (
    <footer className="hungry-hour-footer site-footer" aria-label="Site Footer">
      <div className="hungry-hour-footer-inner">
        <img
          src={footerImage}
          alt="HUNGRY HOUR Footer"
          className="hungry-hour-footer-img"
          loading="lazy"
          width="1280"
          height="528"
        />
      </div>
    </footer>
  );
}
