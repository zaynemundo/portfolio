import { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import {
  profile, brands, stats, cases, archive, phases, beliefs,
  expertiseRows, expertise, tools, jobs, faqs, education,
} from './data.js'
import { Reveal, Counter } from './components.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* ---------- shared ---------- */

function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>{profile.name}<span>.</span></Link>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/" onClick={close}>Index</Link>
          <Link to="/work" onClick={close}>Work</Link>
          <Link to="/about" onClick={close}>About</Link>
          <a href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`} className="btn btn-small" onClick={close}>Email me</a>
        </nav>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>☰</button>
      </div>
    </header>
  )
}

function FinalCta({ title, text }) {
  return (
    <section className="section container">
      <p className="eyebrow">Next step</p>
      <h2 className="section-title">{title}</h2>
      <p className="large" style={{ maxWidth: '620px' }}>{text}</p>
      <div className="contact-row">
        <a className="btn" href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`}>Email me</a>
        <a className="btn btn-ghost" href={profile.phoneHref}>{profile.phone}</a>
      </div>
      <p className="note">
        <a href={`mailto:${profile.email}`}>Email</a> · <a href={profile.phoneHref}>Phone</a> · <a href="/Resume.pdf" download>Resume.pdf</a>
      </p>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="container foot">
        <span>© {new Date().getFullYear()} {profile.name} • Graphic Designer</span>
        <span><Link to="/">Index</Link> · <Link to="/work">Work</Link> · <Link to="/about">About</Link> · <a href="#top">Back to top ↑</a></span>
      </div>
    </footer>
  )
}

function CaseCard({ c }) {
  const inner = (
    <>
      <div className={`case-thumb ${c.thumb}`}></div>
      <div className="case-body">
        <p className="case-tag">{c.client}</p>
        <h3>{c.title}</h3>
        <span className="case-link">{c.linkLabel}</span>
      </div>
    </>
  )
  return (
    <Reveal as="article" className="case">
      {c.link.startsWith('http') ? (
        <a className="case-anchor" href={c.link} target="_blank" rel="noreferrer">{inner}</a>
      ) : (
        <Link className="case-anchor" to={c.link}>{inner}</Link>
      )}
    </Reveal>
  )
}

/* ---------- index page (mirrors metacci.com/en/) ---------- */

function Hero() {
  return (
    <section className="hero container">
      <p className="eyebrow">{profile.role}</p>
      <h1>{profile.headline}</h1>
      <p className="lede">{profile.intro}</p>
      <div className="hero-cta">
        <a className="btn" href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`}>Email me</a>
        <Link to="/work" className="btn btn-ghost">See selected work</Link>
      </div>
      <div className="availability"><span className="dot"></span> {profile.current} • open for select freelance</div>
    </section>
  )
}

function BrandStrip() {
  const row = [...brands, ...brands]
  return (
    <section className="brands">
      <p className="brands-label">Teams & products I&apos;ve worked with</p>
      <div className="marquee">
        <div className="marquee-track">
          {row.map((b, i) => (
            <span key={i} className="brand">{b}<span className="brand-sep">✦</span></span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Growth() {
  return (
    <section className="section container">
      <h2 className="section-title">Growth comes from shipping faster than your competition</h2>
      <p className="large" style={{ maxWidth: '640px' }}>
        I embed with your team as a force multiplier. I set the visual direction so everyone builds
        toward the same outcome, turn your site and content into a speed advantage, and validate
        ideas before they cost you time. The team you already have ships faster — and growth follows.
      </p>
      <div className="stats-grid" style={{ marginTop: '28px' }}>
        {stats.map((s) => (
          <Reveal key={s.label} className="stat">
            <Counter target={s.target} /><span className="suffix">{s.suffix}</span>
            <p>{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function SelectedWork() {
  return (
    <section className="section container">
      <h2 className="section-title">Selected work</h2>
      <div className="case-grid">
        {cases.map((c) => <CaseCard key={c.slug} c={c} />)}
      </div>
      <p style={{ marginTop: '18px' }}><Link className="case-link" to="/work">All work + archive →</Link></p>
    </section>
  )
}

function HowIWork() {
  return (
    <section className="section container">
      <p className="eyebrow">How I work</p>
      <h2 className="section-title">Four phases, measurable outcomes</h2>
      <div className="phase-grid">
        {phases.map((p) => (
          <Reveal key={p.n} className="phase">
            <span className="phase-n">{p.n}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </Reveal>
        ))}
      </div>
      <p className="note" style={{ marginTop: '16px' }}>
        The hand over closes the engagement. It usually opens the next one.
      </p>
    </section>
  )
}

function AboutTeaser() {
  return (
    <section className="section container">
      <h2 className="section-title">I&apos;m Zayne. I design it, then I build it.</h2>
      <p className="large" style={{ maxWidth: '640px' }}>
        I taught myself the web before finishing my degree, spent years in agencies and in-house
        teams shipping sites and campaigns — then founded Corez.pro, an AI builder I design and
        develop myself. I work inside your team, not next to it.
      </p>
      <p style={{ marginTop: '14px' }}><Link className="case-link" to="/about">More about me →</Link></p>
    </section>
  )
}

function Faq() {
  return (
    <section className="section container">
      <p className="eyebrow">FAQ</p>
      <h2 className="section-title">Before you email</h2>
      <div className="faq">
        {faqs.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function IndexPage() {
  return (
    <>
      <Hero />
      <BrandStrip />
      <Growth />
      <SelectedWork />
      <HowIWork />
      <AboutTeaser />
      <Faq />
      <FinalCta
        title="I take on select freelance alongside my role"
        text="Embedded in your team, and owning the outcome together with you. If your brand is moving slower than your ambition, email me."
      />
    </>
  )
}

/* ---------- work page (mirrors metacci.com/en/work) ---------- */

function WorkPage() {
  return (
    <>
      <section className="hero container">
        <h1>Work — four cases. Strategic outcomes.</h1>
      </section>
      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="case-grid">
          {cases.map((c) => <CaseCard key={c.slug} c={c} />)}
        </div>
      </section>
      <section className="section container">
        <h2 className="section-title">Archive</h2>
        <div className="archive">
          {archive.map((a) => (
            <div key={a.client} className="archive-row">
              <strong>{a.client}</strong>
              <span>{a.tags}</span>
              <span className="archive-year">({a.year})</span>
            </div>
          ))}
          <div className="archive-row"><span>+ more freelance brand & web work on request</span><span></span><span></span></div>
        </div>
      </section>
      <FinalCta
        title="I take on select freelance alongside my role"
        text="Embedded in your team, and owning the outcome together with you. If your brand is moving slower than your ambition, email me."
      />
    </>
  )
}

/* ---------- case page (mirrors metacci case flow) ---------- */

function CasePage() {
  const { slug } = useParams()
  const idx = cases.findIndex((c) => c.slug === slug)
  if (idx === -1) return <section className="section container"><h1>Not found</h1><p><Link to="/work">Back to work</Link></p></section>
  const c = cases[idx]
  const next = cases[(idx + 1) % cases.length]
  const external = c.link.startsWith('http')
  return (
    <>
      <section className="container case-top">
        <Link className="back-link" to="/work">← All cases</Link>
      </section>
      <section className="hero container">
        <p className="eyebrow">{c.client}</p>
        <h1>{c.title}</h1>
        <p className="lede">{c.intro}</p>
        {external && <div className="hero-cta"><a className="btn" href={c.link} target="_blank" rel="noreferrer">Visit live site →</a></div>}
      </section>
      <section className="section container case-meta">
        <div><p className="meta-label">Client</p><p>{c.client}</p></div>
        <div><p className="meta-label">Role</p><p>{c.role.join(', ')}</p></div>
        <div><p className="meta-label">Type</p><p>{c.type}</p></div>
        <div><p className="meta-label">Impact</p>{c.impact.map((i) => <p key={i.label}><strong>{i.value}</strong> {i.label}</p>)}</div>
      </section>
      <section className="section container">
        <div className={`case-hero ${c.thumb}`}></div>
      </section>
      {c.sections.map((s) => (
        <section key={s.h} className="section container" style={{ paddingTop: 0 }}>
          <h2 className="section-title">{s.h}</h2>
          {s.ps && s.ps.map((p, i) => <p key={i} className="large" style={{ maxWidth: '680px' }}>{p}</p>)}
          {s.subs && (
            <div className="phase-grid" style={{ gridTemplateColumns: `repeat(${Math.min(s.subs.length, 3)}, 1fr)`, marginTop: '20px' }}>
              {s.subs.map((sub) => (
                <Reveal key={sub.t} className="phase">
                  <h3>{sub.t}</h3>
                  <p>{sub.d}</p>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      ))}
      <section className="section container" style={{ paddingTop: 0 }}>
        <h2 className="section-title">Outcomes</h2>
        <div className="stats-grid">
          {c.impact.map((i) => (
            <div key={i.label} className="stat">
              <span className="num">{i.value}</span>
              <p>{i.label}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '22px' }}>
          {next.link.startsWith('http') ? (
            <a className="case-link" href={next.link} target="_blank" rel="noreferrer">Next case: {next.title} →</a>
          ) : (
            <Link className="case-link" to={next.link}>Next case: {next.title} →</Link>
          )}
        </p>
      </section>
      <FinalCta
        title="I take on select freelance alongside my role"
        text="Embedded in your team, and owning the outcome together with you. If your brand is moving slower than your ambition, email me."
      />
    </>
  )
}

/* ---------- about page (mirrors metacci.com/en/about) ---------- */

function AboutPage() {
  return (
    <>
      <section className="hero container">
        <h1>I almost became just a developer.</h1>
        <p className="lede">
          I always liked making things people can see and touch — and I told myself I was not the
          kind who would spend his life pushing pixels for someone else&apos;s brief.
        </p>
        <p className="lede">
          Years later, the job was never really about the pixels. It is about listening to people,
          understanding what they actually need, and caring enough to get the details right — then
          building it yourself so nothing gets lost.
        </p>
        <p className="lede">
          I studied Creative Computing, shipped agency and in-house work across e-commerce,
          healthcare and media — then founded Corez.pro, which I design and develop end to end.
        </p>
        <p className="lede">
          Today I work embedded in the marketing team at Office Inspirations. Same standups, same
          arguments, same wins: settling direction, building the sites and systems, and making sure
          the bar I leave behind is higher than the one I found.
        </p>
      </section>
      <section className="section container" style={{ paddingTop: 0 }}>
        <p className="eyebrow">Areas of expertise</p>
        <div className="marquee">
          {expertiseRows.map((row, ri) => (
            <div key={ri} className="marquee-track slow">
              {[...row, ...row].map((e, i) => (
                <span key={i} className="brand small">{e}<span className="brand-sep">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="section container">
        <p className="eyebrow">What I believe</p>
        <h2 className="section-title">Six things the work taught me.</h2>
        <div className="beliefs">
          {beliefs.map((b, i) => (
            <Reveal key={b.t} className="belief">
              <h3><span className="belief-n">{String(i + 1).padStart(2, '0')}</span> {b.t}</h3>
              <p>{b.d}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section container" style={{ paddingTop: 0 }}>
        <h2 className="section-title">Experience</h2>
        <div className="timeline">
          {jobs.map((job) => (
            <Reveal as="article" key={job.title} className="job">
              <div className="job-head"><h3>{job.title}</h3><span className="date">{job.date}</span></div>
              <ul>{job.points.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
            </Reveal>
          ))}
        </div>
        <h3 className="subhead">Expertise</h3>
        <div className="cards">
          {expertise.map((e) => (
            <Reveal key={e.title} className="card"><h3>{e.title}</h3><p>{e.desc}</p></Reveal>
          ))}
        </div>
        <h3 className="subhead">Tools</h3>
        <ul className="tags big">{tools.map((t) => <li key={t}>{t}</li>)}</ul>
        <h3 className="subhead">Education</h3>
        <div className="edu-grid">
          {education.map((e) => (
            <Reveal key={e.title} className="edu"><h3>{e.title}</h3><p>{e.sub}</p></Reveal>
          ))}
        </div>
      </section>
      <FinalCta
        title="Tell me about you"
        text="Just a conversation about you, your brand and your team."
      />
    </>
  )
}

/* ---------- contact page (form) ---------- */

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', msg: '' })
  const [note, setNote] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setNote('Please fill all fields.')
      return
    }
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.msg}`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
    setNote('Opening your email app...')
  }
  return (
    <section className="section container">
      <p className="eyebrow">Next step</p>
      <h2 className="section-title">Let&apos;s make your brand move faster</h2>
      <form className="contact-form" onSubmit={submit}>
        <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <textarea rows="4" placeholder="Project details..." value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} required></textarea>
        <button type="submit" className="btn">Send via Email →</button>
        <p className="form-note">{note}</p>
      </form>
    </section>
  )
}

/* ---------- app ---------- */

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="top">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<CasePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<section className="section container"><h1>Not found</h1><p><Link to="/">Back to index</Link></p></section>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
