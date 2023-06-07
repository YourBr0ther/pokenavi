import React from 'react'
import styles from './page.module.css'
import Image from "next/image"

const About = () => {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.item}>
          <div className={styles.title}>
            About
          </div>
          <div className={styles.desc}>
            Here at PokeNavi, we seek to foster new friendships and rekindle the old flames that so many Pokemon created in our youth.
          </div>
        </div>
        <Image className={styles.img} src="/about.png" alt="about picture" width={720} height={405}></Image>
      </div>
    </div>
  )
}

export default About