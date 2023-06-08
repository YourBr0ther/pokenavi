import Footer from './components/footer/Footer'
import Navbar from './components/navbar/Navbar'
import './globals.css'
import { Inter } from 'next/font/google'
import { cstSessionProvider } from './components/SessionProvider/SessionProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PokeNavi',
  description: 'A new way to communicate with your Pokemon',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <cstSessionProvider>
          <div className="container">
            <Navbar />
            {children}
            <Footer />
          </div>
        </cstSessionProvider>
      </body>
    </html>
  )
}
