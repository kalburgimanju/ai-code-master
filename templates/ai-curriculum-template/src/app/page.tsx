import Link from "next/link";
import Image from "next/image";
import { courses, instructor, siteConfig } from "@/lib/curriculum";

const COUPON = "AI_JULY_26";

const COURSE_BASE_URLS: Record<string, string> = {
  builder: "https://www.udemy.com/course/ai-builder-with-n8n-create-agents-voice-agents/",
  aicoder: "https://www.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/",
  leader: "https://www.udemy.com/course/executive-briefing-generative-ai-and-large-language-models-llm/",
  core: "https://www.udemy.com/course/llm-engineering-master-ai-and-large-language-models/",
  agentic: "https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/",
  production: "https://www.udemy.com/course/generative-and-agentic-ai-in-production/",
};

const enrollUrl = (key: string) => `${COURSE_BASE_URLS[key] || "#"}?couponCode=${COUPON}`;

function MilestoneCard({ course }: { course: (typeof courses)[0] }) {
  const panelId = `edc-ms-panel-${course.id}`;
  const previewTools = (course.tools || []).slice(0, 3);
  const moreCount = (course.tools || []).length - previewTools.length;

  return (
    <article className="edc-ms" data-key={course.id} data-reveal="true">
      <span className="edc-marker" aria-hidden="true">{course.n}</span>
      <div className="edc-card">
        <div className="edc-summary" data-summary="true">
          <span className="edc-thumb">
            <img
              src={course.image}
              alt={`${course.title}${course.track ? " " + course.track : ""}`}
              loading="lazy"
              decoding="async"
            />
          </span>
          <div className="sum-mid">
            <h3 className="sum-name">
              {course.title}
              {course.track && <span className="track"> {course.track}</span>}
            </h3>
            <p className="sum-outcome">{course.outcome}</p>
            <div className="sum-tags">
              {previewTools.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
              {moreCount > 0 && <span className="tag more">+{moreCount} more</span>}
            </div>
          </div>
          <div className="sum-aside">
            <span className="sum-dur">
              <span className="lab">Duration</span>
              <span className="val">{course.duration}</span>
            </span>
            <a
              className="edc-btn edc-btn--sm"
              href={enrollUrl(course.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enroll with coupon <span className="arr" aria-hidden="true">→</span>
            </a>
            <button
              type="button"
              className="sum-more"
              data-toggle="true"
              aria-expanded="false"
              aria-controls={panelId}
            >
              Details <span className="chev" aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div
          className="edc-detail"
          id={panelId}
          role="region"
          aria-label={`${course.title}${course.track ? " " + course.track : ""} details`}
        >
          <div className="inner">
            <div className="pad">
              <div className="main">
                <p className="blurb">{course.blurb}</p>
                <div className="meta">
                  <div className="block">
                    <div className="k">Who it is for</div>
                    <div className="v">{course.audience}</div>
                  </div>
                  <div className="block">
                    <div className="k">Expertise</div>
                    <div className="v toolset">
                      {(course.tools || []).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="side">
                <figure className="photo">
                  <img
                    src={course.image}
                    alt={`${course.title}${course.track ? " " + course.track : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="edc-enroll">
                  <a
                    className="edc-btn"
                    href={enrollUrl(course.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Enroll with coupon <span className="arr" aria-hidden="true">→</span>
                  </a>
                  <span className="coupon-note">
                    Coupon <span className="code">{COUPON}</span> applied at checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const phases = [
    {
      num: "Phase one",
      name: "For everyone, technical or not",
      courses: courses.slice(0, 3),
    },
    {
      num: "Phase two",
      name: "For technical and aspiring technical people",
      courses: courses.slice(3, 5),
    },
    {
      num: "Phase three",
      name: "For the technical",
      courses: courses.slice(5, 6),
    },
  ];

  return (
    <>
      <header className="edc-header">
        <div className="edc-header-inner">
          <Link href="/" className="edc-logo">
            <Image
              src="https://i0.wp.com/edwarddonner.com/wp-content/uploads/2023/12/cropped-edworkprofile2.png?fit=1128%2C1128&ssl=1"
              alt="Manjunath Kalburgi"
              width={60}
              height={60}
              className="edc-logo-img"
            />
          </Link>
          <nav className="edc-nav">
            <Link href="/avatar/">Avatar</Link>
            <Link href="/curriculum/" className="active">Curriculum</Link>
            <Link href="/proficient/">Proficiency</Link>
            <Link href="/connect-four/">C4</Link>
            <Link href="/outsmart/">Outsmart</Link>
            <Link href="/about/">About</Link>
            <Link href="/posts/">Posts</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="edc-roadmap" aria-labelledby="edc-rm-title" role="region">
          <div className="edc-wrap">
            <header className="edc-head">
              <h1 className="edc-title" id="edc-rm-title">
                {siteConfig.name}
              </h1>
              <p className="edc-byline">by <em>{instructor.name}</em></p>
              <p className="edc-sub">
                Here are the 6 courses in my AI curriculum. These courses complement
                my posts and projects. Start anywhere, but follow the phases in order.
              </p>
              <div
                className="edc-cred"
                aria-label={`${siteConfig.totalEnrollments.toLocaleString()} enrollments. ${siteConfig.totalCountries} countries. Six courses. One roadmap.`}
              >
                <span className="item">
                  <span className="fig">{siteConfig.totalEnrollments.toLocaleString()}</span> enrollments
                </span>
                <span className="item">
                  <span className="fig">{siteConfig.totalCountries}</span> countries
                </span>
                <span className="item">
                  <span className="fig">Six</span> courses
                </span>
                <span className="item">
                  <span className="fig">One</span> roadmap
                </span>
              </div>

              <div className="edc-topgrid">
                <div className="edc-helper">
                  <p className="helper-q">Not sure where to begin?</p>
                  <div className="edc-choices" role="group" aria-label="Choose where to begin">
                    <button
                      type="button"
                      className="edc-choice"
                      data-choice="builder"
                      aria-pressed="false"
                    >
                      <span className="ch-step">Either…</span>
                      <span className="ch-head">Use Products to build Agents</span>
                      <span className="ch-detail">Start with AI Builder and create agents in n8n.</span>
                    </button>
                    <button
                      type="button"
                      className="edc-choice"
                      data-choice="aicoder"
                      aria-pressed="false"
                    >
                      <span className="ch-step">…or</span>
                      <span className="ch-head">Use Agents to build Products</span>
                      <span className="ch-detail">Start with AI Coder and build software with Claude Code.</span>
                    </button>
                  </div>
                </div>

                <div className="edc-video">
                  <div className="vframe">
                    <div className="ratio">
                      <button
                        type="button"
                        className="vplay"
                        aria-label="Play: Manjunath walks through the curriculum"
                      >
                        <span className="vplay-glyph" aria-hidden="true">▶</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="edc-plan" data-plan="true">
                <div className="edc-rail" aria-hidden="true">
                  <span className="fill"></span>
                </div>
                {phases.map((phase, i) => (
                  <div key={i} className="edc-phase">
                    <span className="ph-num">{phase.num}</span>
                    <span className="ph-name">{phase.name}</span>
                    <span className="ph-rule" aria-hidden="true"></span>
                    {phase.courses.map((c) => (
                      <MilestoneCard key={c.id} course={c} />
                    ))}
                  </div>
                ))}
              </div>
            </header>

            <div className="edc-noscript">
              <p className="ns-lead">
                Six courses that complement each other. You can take them in any order, but I recommend following the phases.
              </p>
              <ul className="ns-list">
                {courses.map((c) => (
                  <li key={c.id}>
                    <span className="nm">{c.title}</span>
                    {c.track && <> {c.track}</>}.{" "}
                    <a href={enrollUrl(c.id)} target="_blank" rel="noopener noreferrer">
                      Enroll with coupon
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <section className="edc-dest" data-dest="true" aria-labelledby="edc-dest-title">
              <span className="dest-marker" aria-hidden="true"></span>
              <div className="dest-card">
                <div className="dest-inner">
                  <div className="dest-eyebrow">The destination</div>
                  <h2 id="edc-dest-title">Proficient AI Engineer</h2>
                  <p>
                    Complete all six milestones, build and deploy real world projects, and you are positioned for success as an AI Engineer.
                  </p>
                  <a
                    className="edc-btn--gold"
                    href={siteConfig.proficientUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join the directory <span className="arr" aria-hidden="true">→</span>
                  </a>
                  <div className="dest-track" aria-hidden="true">
                    {courses.map((c) => (
                      <span key={c.id}>
                        <span className="tick"></span>
                        {c.title}
                        {c.track && <> {c.track}</>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <footer className="edc-foot">
        <span className="sep" aria-hidden="true"></span>
        <span className="sep" aria-hidden="true"></span>
      </footer>

      <script src="/edc-roadmap.js" defer />
    </>
  );
}
