export function Landing() {
  return (
    <div className="product">
      <header className="product-header">
        <a href="./" className="wordmark">
          HowlScene<span aria-hidden="true"> / </span>
        </a>
        <a href="./examples/ink-wash-story/">View the cinematic sample ↗</a>
      </header>
      <main>
        <section className="product-hero">
          <p className="product-kicker">An open-source website studio</p>
          <h1>
            Your story.
            <br />
            <em>A different atmosphere.</em>
          </h1>
          <p className="product-intro">
            Give your ideas a home. Choose a visual theme, shape your content,
            and download a website you can keep.
          </p>
          <div className="product-actions">
            <a className="primary-link" href="./editor/">
              Open the editor <span aria-hidden="true">↗</span>
            </a>
            <a href="./examples/ink-wash-story/">
              Explore the cinematic sample
            </a>
            <a href="./examples/william-elias/">
              Explore the developer portfolio example
            </a>
          </div>
          <p className="product-note">
            Early preview · No account required · Your draft stays in this
            browser
          </p>
        </section>
        <section className="product-themes" aria-labelledby="themes-heading">
          <div>
            <p className="product-kicker">Same words. Three worlds.</p>
            <h2 id="themes-heading">Find your setting.</h2>
            <p>Switch themes while keeping your content.</p>
          </div>
          <div className="theme-samples">
            <article className="sample ink-sample">
              <span>01 / Ink Wash</span>
              <h3>
                Room to
                <br />
                breathe.
              </h3>
              <p>Soft tones. Quiet depth.</p>
            </article>
            <article className="sample cyber-sample">
              <span>02 / Cyberpunk</span>
              <h3>
                Signal
                <br />
                your ideas.
              </h3>
              <p>Dark space. Electric accents.</p>
            </article>
            <article className="sample modern-sample">
              <span>03 / Modern Professional</span>
              <h3>
                Clarity
                <br />
                comes first.
              </h3>
              <p>A composed, readable canvas.</p>
            </article>
          </div>
        </section>
        <section className="product-steps" aria-labelledby="steps-heading">
          <h2 id="steps-heading">From first words to your own website.</h2>
          <ol>
            <li>
              <strong>Make it yours</strong>
              <p>
                Start with a template, edit your introduction, and arrange your
                sections.
              </p>
            </li>
            <li>
              <strong>Save your work</strong>
              <p>
                Local saving keeps your draft here. Download an editable backup
                for safekeeping.
              </p>
            </li>
            <li>
              <strong>Take it with you</strong>
              <p>
                Download your website ZIP and follow the guide to put it on a
                static web host.
              </p>
            </li>
          </ol>
        </section>
      </main>
      <footer className="product-footer">
        <span>HowlScene · An independent open-source project</span>
        <a href="./editor/">Start creating ↗</a>
      </footer>
    </div>
  );
}
