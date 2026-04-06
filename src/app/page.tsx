'use client'

import { useEffect } from 'react'
import GalaxySimulation from './GalaxySimulation'
import PortalVortex from './PortalVortex'
import ShaderText from './ShaderText'

const simulations = [
  {
    id: 'hub',
    label: 'Command Center',
    title: 'elliottelford.com',
    desc: 'The nexus. The origin point. Where every simulation converges and every path begins. You are here.',
    url: 'elliottelford.com',
    href: 'https://elliottelford.com',
    icon: '◉',
    className: 'sim-card--hub',
  },
  {
    id: 'physics',
    label: 'Simulation 01',
    title: "Parker's Physics",
    desc: 'Where the laws bend and the equations breathe. A playground for the curious mind — physics made tangible, visceral, alive.',
    url: 'parkersphysics.com',
    href: 'https://parkersphysics.com',
    icon: '⚛',
    className: 'sim-card--physics',
  },
  {
    id: 'cosmos',
    label: 'Simulation 02',
    title: 'Explore the Universe 2175',
    desc: 'The year is 2175. The stars have stories. Step beyond the atmosphere and into the unknown — where discovery has no ceiling.',
    url: 'exploretheuniverse2175.com',
    href: 'https://exploretheuniverse2175.com',
    icon: '✦',
    className: 'sim-card--cosmos',
  },
  {
    id: 'landscape',
    label: 'Simulation 03',
    title: 'Telford Landscaping',
    desc: 'Earth, stone, water, light. Crafting living spaces from raw terrain — where nature meets intention and landscapes become legacies.',
    url: 'telfordlandscaping.com',
    href: 'https://telfordlandscaping.com',
    icon: '◈',
    className: 'sim-card--landscape',
  },
  {
    id: 'projects',
    label: 'Simulation 04',
    title: 'Telford Projects',
    desc: 'The workshop. The proving ground. Where ideas crystallize into builds and every project is an experiment in what\'s possible.',
    url: 'telfordprojects.com',
    href: 'https://telfordprojects.com',
    icon: '⬡',
    className: 'sim-card--projects',
  },
]

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Galaxy simulation background */}
      <GalaxySimulation />

      {/* ─── Hero ─── */}
      <section className="hero">
        <PortalVortex />

        <div className="hero-tagline-wrap">
          <ShaderText text="Where Do You Belong?" highlightWord="You" />
        </div>

        <p className="hero-sub">elliottelford.com</p>

        <div className="scroll-hint">
          <span>Enter</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="section-divider">
        <div className="divider-line" />
        <div className="divider-diamond" />
        <div className="divider-line" />
      </div>

      {/* ─── The Architect ─── */}
      <section className="architect reveal">
        <p className="architect-label">The Architect</p>
        <h2 className="architect-name">Elliot Telford</h2>
        <p className="architect-desc">
          Builder of worlds. Runner of simulations. Every domain is a doorway —
          each one a different lens on reality, a different question worth asking.
          Physics. Cosmos. Earth. Creation. Four simulations, one architect.
          The only question left is yours.
        </p>
      </section>

      {/* ─── Divider ─── */}
      <div className="section-divider">
        <div className="divider-line" />
        <div className="divider-diamond" />
        <div className="divider-line" />
      </div>

      {/* ─── Simulations ─── */}
      <section className="simulations">
        <div className="simulations-header reveal">
          <p className="simulations-label">Active Simulations</p>
          <h2 className="simulations-title">Choose Your Reality</h2>
        </div>

        <div className="sim-grid">
          {simulations.map((sim, i) => (
            <a
              key={sim.id}
              href={sim.href}
              target={sim.id === 'hub' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`sim-card ${sim.className} reveal`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="sim-icon">{sim.icon}</div>
              <p className="sim-card-label">{sim.label}</p>
              <h3 className="sim-card-title">{sim.title}</h3>
              <p className="sim-card-desc">{sim.desc}</p>
              <p className="sim-card-url">{sim.url}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <p className="footer-text">
          <a href="https://elliottelford.com" className="footer-link">
            elliottelford.com
          </a>{' '}
          &mdash; all simulations active
        </p>
      </footer>
    </>
  )
}
