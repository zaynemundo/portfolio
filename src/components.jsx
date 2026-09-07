import { useEffect, useRef, useState } from 'react'

export function Reveal({ children, className = '', as: Tag = 'div', ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function Counter({ target, duration = 1200 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return
          started.current = true
          const start = performance.now()
          const step = (now) => {
            const p = Math.min((now - start) / duration, 1)
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          io.unobserve(el)
        })
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return <span ref={ref} className="num">{value}</span>
}
