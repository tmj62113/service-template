import SEO from "../components/SEO";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <SEO
        title="About MJ Peterson"
        description="Learn about Mark J Peterson, an Iowa grown/KC adopted artist specializing in steampunk and Victorian-inspired pen and ink drawings."
        keywords={[
          "Mark J Peterson",
          "MJ Peterson",
          "artist biography",
          "steampunk artist",
          "pen and ink artist",
          "Iowa artist",
          "Kansas City artist",
        ]}
      />

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h1>About MJ Peterson</h1>
          <div className="about-content">
            <div className="about-image">
              <img src="/images/peterson_headshot.jpg" alt="MJ Peterson" />
            </div>
            <div className="about-text">
              <p>
                I am an Iowa grown/KC adopted, artist, adventure-seeker and grateful
                dad (to a spirited 9 yr. old boy) who has navigated life with a
                relentless pursuit of passions and whims! This journey has been led
                by a desire to tell stories and share ideas through visual
                communication.
              </p>
              <p>
                Having received my BFA in Painting and Drawing from Drake University
                in 1996 and an MFA in Graphic Design from Georgia State University
                in 2006, I've stayed active as a creative and spanned the art
                spectrum from fine art and illustration, to print and digital
                design. I currently manage a team of graphic designers for a digital
                solutions marketing company.
              </p>
              <p>
                Recently, I've been inspired to create surreal and steam punk style
                pen and ink drawings of fantastical places. The use of toys and
                games in story-telling have been consistent themes in my art career.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}