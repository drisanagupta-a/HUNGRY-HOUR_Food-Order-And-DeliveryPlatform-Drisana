import foodPlate from "../../assets/Mediterranean Sticker Food Collection 2.png";
import oliveBowl from "../../assets/Mediterranean Feast Sticker Set 2.png";
import orangeDrink from "../../assets/Mediterranean Feast Sticker Set 5.png";
import lemon from "../../assets/Layer_1 (4).png";
import oliveLeaves from "../../assets/Layer_1.png";
import oliveLeavesDiagonal from "../../assets/Layer_1 (1).png";
import oliveLeavesRight from "../../assets/Layer_1 (2).png";
import hungryHourLogo from "../../assets/Group 9.svg";
import loginHeading from "../../assets/LOG IN.svg";
import signupHeading from "../../assets/signup.svg";

export default function AuthLayout({ eyebrow, title, children }) {
  const headingAsset =
    title === "Log in"
      ? loginHeading
      : title === "Sign up"
        ? signupHeading
        : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#FDE4BF] text-[#000000]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-2">
        <section
          aria-label="Hungry Hour"
          className="relative min-h-[390px] overflow-hidden sm:min-h-[470px] lg:min-h-screen"
        >
          {/* Top-center hanging leaf branch (clear of the logo) */}
          <img
            src={oliveLeaves}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 left-[46%] z-10 w-36 sm:w-48 lg:w-56"
          />

          {/* Left edge leaf branch (below logo, behind drink) */}
          <img
            src={oliveLeavesRight}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-[40%] z-10 w-36 -translate-x-4 -rotate-6 sm:w-44 lg:w-52"
          />

          {/* Bottom-right leaf branch rising near plate */}
          <img
            src={oliveLeavesDiagonal}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[46%] z-10 w-36 sm:w-48 lg:w-56"
          />

          {/* HUNGRY HOUR Logo in upper-left area */}
          <img
            src={hungryHourLogo}
            alt="HUNGRY HOUR"
            className="relative z-20 ml-6 mt-7 h-auto w-52 sm:ml-10 sm:mt-10 sm:w-60 lg:ml-12 lg:mt-12 lg:w-64"
          />

          {/* Orange drink below logo on the left */}
          <img
            src={orangeDrink}
            alt=""
            aria-hidden="true"
            className="absolute left-[12%] top-[25%] z-20 w-28 sm:w-36 lg:w-40"
          />

          {/* Olive bowl to the right of the drink */}
          <img
            src={oliveBowl}
            alt=""
            aria-hidden="true"
            className="absolute left-[36%] top-[27%] z-20 w-20 sm:w-26 lg:w-28"
          />

          {/* Main food plate prominently in the lower-middle area */}
          <img
            src={foodPlate}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[6%] left-[17%] z-20 w-[clamp(10rem,28vw,23rem)] sm:w-[320px] lg:w-[360px]"
          />

          {/* Lemon illustration partially cropped near bottom-left corner */}
          <img
            src={lemon}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-0 z-30 w-28 sm:w-36 lg:w-44"
          />
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="w-full max-w-[520px] rounded-[2rem] bg-[#FEF4E5] px-6 py-9 shadow-[0_20px_70px_rgba(75,48,26,0.12)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            {/* Small yellow decorative brand asset */}
            <div className="mb-3 flex justify-center text-[#F4AB0A]" aria-hidden="true">
              <svg
                width="24"
                height="18"
                viewBox="0 0 24 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 1.5C11.2 1.5 10.6 3 10.6 5.5C10.6 8 11.2 12 12 12C12.8 12 13.4 8 13.4 5.5C13.4 3 12.8 1.5 12 1.5Z"
                  fill="#F4AB0A"
                />
                <path
                  d="M5.5 4.8C5 4.2 5.9 3.3 7.6 4.4C9.3 5.5 12 9.2 11.5 9.8C11 10.4 8 8.1 6.7 6.7C5.9 5.9 5.7 5.3 5.5 4.8Z"
                  fill="#F4AB0A"
                />
                <path
                  d="M18.5 4.8C19 4.2 18.1 3.3 16.4 4.4C14.7 5.5 12 9.2 12.5 9.8C13 10.4 16 8.1 17.3 6.7C18.1 5.9 18.3 5.3 18.5 4.8Z"
                  fill="#F4AB0A"
                />
              </svg>
            </div>

            <p
              className="text-center text-[18px] font-normal uppercase tracking-[0.08em] text-[#5F584F]"
              style={{ fontFamily: "Inter, Arial, sans-serif" }}
            >
              {eyebrow}
            </p>
            <h1
              className="mb-7 mt-2 flex justify-center text-center text-[clamp(3rem,6.5vw,62.83px)] font-normal uppercase leading-[1.05] text-[#000000]"
              style={{ fontFamily: '"Maiden Orange", Georgia, serif' }}
            >
              {headingAsset ? (
                <img
                  src={headingAsset}
                  alt={title}
                  className="mx-auto block h-auto w-[min(100%,260px)]"
                />
              ) : (
                title
              )}
            </h1>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
