import Link from 'next/link'
import React from 'react'

const links = [
  {
    id: 1,
    title: "Home",
    url: "/"

  },
  {
    id: 2,
    title: "Features",
    url: "/features"

  },
  {
    id: 3,
    title: "Get PokeNavi",
    url: "/getpokenavi"

  },
  {
    id: 4,
    title: "About",
    url: "/about"

  }

]

const Navbar = () => {
  return (
    <div>
      <Link href="/">PokeNavi</Link>
      <div>
        {links.map((link) => (
          <Link key={link.id} href={link.url}>
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  )
}


export default Navbar