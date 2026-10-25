import foodPlate from "../../assets/Mediterranean Sticker Food Collection 2.png";
import oliveBowl from "../../assets/Mediterranean Feast Sticker Set 2.png";
import orangeDrink from "../../assets/Mediterranean Feast Sticker Set 5.png";
import lemon from "../../assets/Layer_1 (4).png";
import oliveLeaves from "../../assets/Layer_1.png";
import oliveLeavesDiagonal from "../../assets/Layer_1 (1).png";
import oliveLeavesRight from "../../assets/Layer_1 (2).png";
import oliveLeavesCorner from "../../assets/Layer_1 (3).png";
import hungryHourLogo from "../../assets/Group 9.svg";
import loginHeading from "../../assets/LOG IN.svg";
import signupHeading from "../../assets/SIGN UP.png";

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
          <img
            src={oliveLeaves}
            alt=""
            aria-hidden="true"
            className="absolute -left-8 -top-12 z-0 w-36 sm:w-48 lg:w-56"
          />
          <img
            src={oliveLeavesDiagonal}
            alt=""
            aria-hidden="true"
            className="absolute -right-8 top-0 z-0 w-40 rotate-12 sm:w-56 lg:w-64"
          />
          <img
            src={oliveLeavesRight}
            alt=""
            aria-hidden="true"
            className="absolute -left-12 top-[38%] z-0 w-36 -rotate-12 sm:w-48 lg:w-56"
          />
          <img
            src={oliveLeavesCorner}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-8 right-0 z-0 w-36 rotate-180 sm:w-48 lg:w-56"
          />

          <img
            src={hungryHourLogo}
            alt="HUNGRY HOUR"
            className="relative z-10 ml-6 mt-7 h-auto w-52 sm:ml-10 sm:mt-10 sm:w-60 lg:ml-14 lg:mt-12 lg:w-64"
          />

          <img
            src={orangeDrink}
            alt=""
            aria-hidden="true"
            className="absolute left-[16%] top-[22%] z-10 w-24 sm:w-32 lg:left-[15%] lg:top-[20%] lg:w-40"
          />
          <img
            src={oliveBowl}
            alt=""
            aria-hidden="true"
            className="absolute left-[48%] top-[34%] z-10 w-20 sm:w-28 lg:left-[45%] lg:top-[32%] lg:w-32"
          />
          <img
            src={foodPlate}
            alt=""
            aria-hidden="true"
            className="absolute bottom-4 left-[15%] z-10 w-[clamp(10rem,28vw,25rem)] sm:bottom-8 sm:left-[19%] lg:bottom-[8%] lg:left-[16%]"
          />
          <img
            src={lemon}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-8 left-0 z-20 w-28 sm:w-36 lg:-bottom-10 lg:w-44"
          />
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="w-full max-w-[520px] rounded-[2rem] bg-[#FEF4E5] px-6 py-9 shadow-[0_20px_70px_rgba(75,48,26,0.12)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="mb-6" aria-hidden="true">
              <span className="text-2xl">🍊</span>
            </div>
            <p
              className="text-[18px] font-normal uppercase tracking-[0.08em] text-[#5F584F]"
              style={{ fontFamily: "Inter, Arial, sans-serif" }}
            >
              {eyebrow}
            </p>
            <h1
              className="mb-7 mt-2 text-[clamp(3rem,6.5vw,62.83px)] font-normal uppercase leading-[1.05] text-[#000000]"
              style={{ fontFamily: '"Maiden Orange", Georgia, serif' }}
            >
              {headingAsset ? (
                <img
                  src={headingAsset}
                  alt={title}
                  className="block h-auto w-[min(100%,260px)]"
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
