import React from 'react'
import styles from './page.module.css'
import Image from "next/image"

const Features = () => {
  return (
    <div className={styles.container}>

      <div className={styles.feature}>
        <div className={styles.item}>
          <h1 className={styles.title}>Extend the adventure</h1>
          <p className={styles.desc}>There is no reason to stop enjoying the Pokemon that you battled with after so many encounters. Why not bring them with you into the real world.</p>
        </div>
        <div className={styles.imgborder}>
          <Image className={styles.img} src="/feature.png" alt="Feature 1" width={175} height={175}></Image>
        </div>
      </div>

      <div className={styles.feature}>
      <div className={styles.imgborder}>
          <Image className={styles.img} src="/feature.png" alt="Feature 1" width={175} height={175}></Image>
        </div>
        <div className={styles.item}>
          <h1 className={styles.title}>Authentic experiences</h1>
          <p className={styles.desc}>Each Pokemon is brought to life using their age, nature, PokeDex entries to create a companion all of your own.</p>
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.item}>
          <h1 className={styles.title}>Personal assistant</h1>
          <p className={styles.desc}>Each Pokemon is backed by ChatGPT4, so they are extremely smart. </p>
        </div>
        <div className={styles.imgborder}>
          <Image className={styles.img} src="/feature.png" alt="Feature 1" width={175} height={175}></Image>
        </div>
      </div>

      <div className={styles.feature}>
      <div className={styles.imgborder}>
          <Image className={styles.img} src="/feature.png" alt="Feature 1" width={175} height={175}></Image>
        </div>
        <div className={styles.item}>
          <h1 className={styles.title}>Short and long memories</h1>
          <p className={styles.desc}>Your Pokemon will be able to remember important things about you. It will also be able to recall several days worth of key details.</p>
        </div>
      </div>      
      
      <div className={styles.feature}>
        <div className={styles.item}>
          <h1 className={styles.title}>Dream mode</h1>
          <p className={styles.desc}>Sleep is an important part of our daily lives. It is also important for your Pokemon as well. Did they have a nightmare or a wonderful dream?</p>
        </div>
        <div className={styles.imgborder}>
          <Image className={styles.img} src="/feature.png" alt="Feature 1" width={175} height={175}></Image>
        </div>
      </div>

      <div className={styles.feature}>
      <div className={styles.imgborder}>
          <Image className={styles.img} src="/feature.png" alt="Feature 1" width={175} height={175}></Image>
        </div>
        <div className={styles.item}>
          <h1 className={styles.title}>Idle Mode</h1>
          <p className={styles.desc}>Sometimes, it is nice just having your Pokemon around or you aren't necessarily in the mood to communicate. Idle mode will allow your Pokemon </p>
        </div>
      </div>      

    </div>
  )
}

export default Features