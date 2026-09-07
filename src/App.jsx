import { useState } from 'react'
import { profile, brands, stats, cases, phases, expertise, tools, jobs, faqs, education } from './data.js'
import { Reveal, Counter } from './components.jsx'

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="logo">Zayne Mundo<span>.</span></a>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <a href="#top" onClick={() => setOpen(false)}>Index</a>
          <a href="#work" onClick={() => setOpen(false)}>Work</a>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`} className="btn btn-small" onClick={() => setOpen(false)}>Email me</a>
        </nav>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>☰</button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero container">
      <div className="hero-text">
        <p className="eyebrow">{profile.role}</p>
        <h1>{profile.headline}</h1>
        <p className="lede">{profile.intro}</p>
        <div className="hero-cta">
          <a className="btn" href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`}>Email me</a>
          <a href="#work" className="btn btn-ghost">See selected work</a>
        </div>
        <div className="availability"><span className="dot"></span> {profile.current} • open for select freelance</div>
      </div>
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

function Work() {
  return (
    <section id="work" className="section container">
      <h2 className="section-title">Selected work</h2>
      <div className="case-grid">
        {cases.map((c) => (
          <Reveal as="article" key={c.title} className="case">
            <div className={`case-thumb ${c.thumb}`}></div>
            <div className="case-body">
              <p className="case-tag">{c.tag}</p>
              <h3>{c.title}</h3>
              <p className="case-outcome">{c.outcome}</p>
              <a
                className="case-link"
                href={c.link}
                {...(c.link.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {c.linkLabel}
              </a>
            </div>
          </Reveal>
        ))}
      </div>
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
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section container">
      <h2 className="section-title">I&apos;m Zayne. I&apos;ve done this across agencies, healthcare and media.</h2>
      <div className="two-col">
        <div>
          <p className="large">
            Designer by craft, developer by training. I spent years in agencies and in-house teams
            shipping e-commerce, campaigns and content — then founded <strong>Corez.pro</strong>, an AI
            builder that turns ideas into websites, apps and games, which I design and develop myself.
          </p>
          <p className="large">
            Today I work inside the marketing team at <strong>Office Inspirations</strong> as a Graphic
            Designer / Assistant Marketing. The teams I work with ship sharper. The systems I build keep running.
          </p>
          <div className="contact-row">
            <a className="btn btn-ghost" href="/Resume.pdf" download>Resume.pdf</a>
            <a className="btn btn-ghost" href={profile.phoneHref}>{profile.phone}</a>
          </div>
        </div>
        <div>
          <h3 className="subhead" style={{ marginTop: 0 }}>Experience</h3>
          <div className="timeline">
            {jobs.map((job) => (
              <Reveal as="article" key={job.title} className="job">
                <div className="job-head"><h3>{job.title}</h3><span className="date">{job.date}</span></div>
                <ul>
                  {job.points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <h3 className="subhead">Expertise</h3>
      <div className="cards">
        {expertise.map((e) => (
          <Reveal key={e.title} className="card"><h3>{e.title}</h3><p>{e.desc}</p></Reveal>
        ))}
      </div>
      <h3 className="subhead">Tools</h3>
      <ul className="tags big">
        {tools.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <h3 className="subhead">Education</h3>
      <div className="edu-grid">
        {education.map((e) => (
          <Reveal key={e.title} className="edu"><h3>{e.title}</h3><p>{e.sub}</p></Reveal>
        ))}
      </div>
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

function Contact() {
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
    <section id="contact" className="section container contact">
      <p className="eyebrow">Next step</p>
      <h2 className="section-title">Let&apos;s make your brand move faster</h2>
      <p className="large">Have a brand, website, or campaign in mind? I reply fast.</p>
      <div className="contact-row">
        <a className="btn" href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`}>Email me</a>
        <a className="btn btn-ghost" href={profile.phoneHref}>{profile.phone}</a>
      </div>
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

function Footer() {
  return (
    <footer>
      <div className="container foot">
        <span>© {new Date().getFullYear()} {profile.name} • Graphic Designer</span>
        <span><a href={`mailto:${profile.email}`}>Email</a> • <a href={profile.phoneHref}>Phone</a> • <a href="#top">Back to top ↑</a></span>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <BrandStrip />
        <Growth />
        <Work />
        <HowIWork />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
