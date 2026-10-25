export default function Loader({
  message = "WAKING UP OUR KITCHEN...",
  error,
  onRetry,
  onLogin,
}) {
  return (
    <main className={`kitchen-loader${error ? " kitchen-loader-failed" : ""}`}>
      <section className="kitchen-loader-content" aria-labelledby="loader-brand">
        <div className="kitchen-loader-brand">
          <span className="kitchen-loader-mark" aria-hidden="true">
            hh
          </span>
          <h1 id="loader-brand">HUNGRY HOUR</h1>
        </div>

        <div className="burger-stage" aria-hidden="true">
          <div className="burger-plate" />
          <div className="burger-stack">
            <span className="burger-layer burger-bun-top">
              <i className="sesame sesame-one" />
              <i className="sesame sesame-two" />
              <i className="sesame sesame-three" />
              <i className="sesame sesame-four" />
            </span>
            <span className="burger-layer burger-lettuce" />
            <span className="burger-layer burger-cheese" />
            <span className="burger-layer burger-patty" />
            <span className="burger-layer burger-bun-bottom" />
          </div>
        </div>

        {error ? (
          <div className="kitchen-loader-error" role="alert">
            <h2>We couldn&apos;t reach the kitchen</h2>
            <p>{error}</p>
            <div className="kitchen-loader-actions">
              {onRetry && (
                <button type="button" onClick={onRetry}>
                  Try again
                </button>
              )}
              {onLogin && (
                <button
                  className="kitchen-loader-secondary"
                  type="button"
                  onClick={onLogin}
                >
                  Go to login
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="kitchen-loader-status">
            <p role="status" aria-live="polite">
              {message}
            </p>
            <span aria-hidden="true">
              The freshest things take a moment.
            </span>
            <div className="kitchen-progress" aria-hidden="true">
              <i />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}