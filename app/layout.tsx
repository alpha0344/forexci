import './globals.css'
import { Poppins } from 'next/font/google'
import Navbar from '../components/navbar'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins'
})

export const metadata = {
  title: 'ForexCI - Trading Platform',
  description: 'Plateforme de trading Forex moderne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={poppins.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}