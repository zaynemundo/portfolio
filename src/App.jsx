import { useState } from 'react'
import { profile, stats, expertise, tools, jobs, works, education } from './data.js'
import { Reveal, Counter } from './components.jsx'

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="logo">ZM<span>.</span></a>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#experience" onClick={() => setOpen(false)}>Experience</a>
          <a href="#expertise" onClick={() => setOpen(false)}>Expertise</a>
          <a href="#work" onClick={() => setOpen(false)}>Work</a>
          <a href="#education" onClick={() => setOpen(false)}>Education</a>
          <a href="#contact" className="btn btn-small" onClick={() => setOpen(false)}>Hire Me</a>
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
        <h1>ZAYNE<br />MUNDO</h1>
        <p className="lede">{profile.lede}</p>
        <div className="hero-cta">
          <a href="#work" className="btn">View Capabilities</a>
          <a href="/Resume.pdf" className="btn btn-ghost" download>Download Resume ↓</a>
        </div>
        <div className="hero-meta">
          <div><strong>✉</strong> <a href={`mailto:${profile.email}`}>{profile.email}</a></div>
          <div><strong>✆</strong> <a href={profile.phoneHref}>{profile.phone}</a></div>
        </div>
      </div>
      <div className="hero-card">
        <div className="avatar">ZM</div>
        <h3>Visual Design • Web • Social</h3>
        <p>Creating cohesive identities across social media, websites, and large-format branding.</p>
        <ul className="tags">
          <li>Photoshop</li><li>Illustrator</li><li>Figma</li><li>WordPress</li><li>HTML5</li><li>CSS3</li><li>JavaScript</li>
        </ul>
        <div className="availability"><span className="dot"></span> Open for freelance &amp; full-time</div>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="stats">
      <div className="container stats-grid">
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

function About() {
  return (
    <section id="about" className="section container">
      <h2 className="section-title">About</h2>
      <div className="two-col">
        <p className="large">I&apos;m Zayne — a designer-developer hybrid. I do design research, build responsive websites, and run data-driven social + SEO that turns engagement into measurable leads.</p>
        <ul className="checklist">
          <li>Multi-channel design: social, web, large-format branding</li>
          <li>Content creation: AI-assisted visuals &amp; illustrations</li>
          <li>SEO + analytics reporting, funnels for lead generation</li>
          <li>Client proposals, presentations &amp; relationship management</li>
        </ul>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className="section container">
      <h2 className="section-title">Experience</h2>
      <div className="timeline">
        {jobs.map((job) => (
          <Reveal as="article" key={job.title} className="job">
            <div className="job-head"><h3>{job.title}</h3><span className="date">{job.date}</span></div>
            <ul>
              {job.points.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Expertise() {
  return (
    <section id="expertise" className="section container">
      <h2 className="section-title">Expertise</h2>
      <div className="cards">
        {expertise.map((e) => (
          <Reveal key={e.title} className="card"><h3>{e.title}</h3><p>{e.desc}</p></Reveal>
        ))}
      </div>
      <h3 className="subhead">Tools</h3>
      <ul className="tags big">
        {tools.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  )
}

function Work() {
  const [filter, setFilter] = useState('all')
  const filters = ['all', 'branding', 'social', 'web']
  const visible = works.filter((w) => filter === 'all' || w.cat === filter)
  return (
    <section id="work" className="section container">
      <h2 className="section-title">Capabilities / Selected Work Types</h2>
      <div className="work-filters">
        {filters.map((f) => (
          <button key={f} className={`filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="work-grid">
        {visible.map((w) => (
          <Reveal key={w.title} className="work">
            <div className={`thumb ${w.thumb}`}></div>
            <h4>{w.title}</h4><p>{w.sub}</p>
          </Reveal>
        ))}
      </div>
      <p className="note">Replace these placeholders with your real Behance / Drive links — each card is ready to link.</p>
    </section>
  )
}

function Education() {
  return (
    <section id="education" className="section container">
      <h2 className="section-title">Education</h2>
      <div className="edu-grid">
        {education.map((e) => (
          <Reveal key={e.title} className="edu"><h3>{e.title}</h3><p>{e.sub}</p></Reveal>
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
      <h2 className="section-title">Let&apos;s work together</h2>
      <p className="large">Have a brand, website, or campaign in mind? I reply fast.</p>
      <div className="contact-row">
        <a className="btn" href={`mailto:${profile.email}?subject=Portfolio%20Inquiry`}>Email Me</a>
        <a className="btn btn-ghost" href={profile.phoneHref}>{profile.phone}</a>
        <a className="btn btn-ghost" href="/Resume.pdf" download>Resume.pdf</a>
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
        <span>© {new Date().getFullYear()} Zayne Mundo • Graphic Designer</span>
        <a href="#top">Back to top ↑</a>
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
        <Stats />
        <About />
        <Experience />
        <Expertise />
        <Work />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
