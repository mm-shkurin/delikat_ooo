import { useRouteBodyClass } from '../../shared/ui/useRouteBodyClass'
import { useStoreChromeContext } from '../../app/storeChrome/StoreChromeProvider'
import { elementById, requestFrame } from '../../shared/browser/dom'
import '../../styles/landing.css'
import { HeroSection } from './components/HeroSection'
import { LandingFooter } from './components/LandingFooter'
import { LandingNav } from './components/LandingNav'
import { PackagingSection } from './components/PackagingSection'
import { StoreOverlays } from '../../app/storeChrome/StoreOverlays'

export function LandingPage() {
  useRouteBodyClass('route-landing')
  const chrome = useStoreChromeContext()
  const openAuth = () => chrome.openLayer('auth')

  return (
    <>
      <div className="hero-shell" id="welcome">
        <LandingNav chrome={chrome} onOpenAuth={openAuth} />
        <HeroSection chrome={chrome} onOpenAuth={openAuth} />
      </div>
      <PackagingSection />
      <LandingFooter
        onPrivacyClick={() => {
          chrome.setPrivacyNoteVisible(true)
          requestFrame(() => elementById('privacy-note')?.focus())
        }}
      />
      <StoreOverlays chrome={chrome} />
    </>
  )
}
