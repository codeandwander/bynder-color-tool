import LogoColorTool from '@/components/LogoColorTool'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bynder Color Tool",
  description: "How unique is your color palette?",
};


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2">
      <LogoColorTool />
    </main>
  )
}