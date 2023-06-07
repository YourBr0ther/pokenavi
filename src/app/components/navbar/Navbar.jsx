import Link from 'next/link'
import React from 'react'
import styles from "./navbar.module.css"
import Image from 'next/image'


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

  },
  {
    id: 5,
    title: "Dashboard",
    url: "/dashboard"

  }

]

const Navbar = () => {
  return (
    <div className={styles.container}>
      <div>
        <Image className={styles.logo} src="/poke-radar-512.png" alt="PokeRadar" width={32} height={32}></Image>
        <Link className={styles.title} href="/">PokeNavi</Link>
      </div>
      <div className={styles.links}>
        {links.map((link) => (
          <Link key={link.id} href={link.url}>
            {link.title}
          </Link>
        ))}
        <div><button className={styles.signin}>Sign In</button></div>
      </div>
    </div>
  )
}

export default Navbar