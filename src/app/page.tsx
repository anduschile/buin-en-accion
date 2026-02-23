
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Rules } from '@/components/home/Rules'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Hero />
      <HowItWorks />
      <Rules />
    </div>
  )
}
