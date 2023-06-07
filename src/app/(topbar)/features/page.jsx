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
          <h1 className={styles.title}>Extend the adventure</h1>
          <p className={styles.desc}>There is no reason to stop enjoying the Pokemon that you battled with after so many encounters. Why not bring them with you into the real world.</p>
        </div>
      </div>
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
          <h1 className={styles.title}>Extend the adventure</h1>
          <p className={styles.desc}>There is no reason to stop enjoying the Pokemon that you battled with after so many encounters. Why not bring them with you into the real world.</p>
        </div>
      </div>      <div className={styles.feature}>
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
          <h1 className={styles.title}>Extend the adventure</h1>
          <p className={styles.desc}>There is no reason to stop enjoying the Pokemon that you battled with after so many encounters. Why not bring them with you into the real world.</p>
        </div>
      </div>      <div className={styles.feature}>
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
          <h1 className={styles.title}>Extend the adventure</h1>
          <p className={styles.desc}>There is no reason to stop enjoying the Pokemon that you battled with after so many encounters. Why not bring them with you into the real world.</p>
        </div>
      </div>

    </div>
  )
}

export default Features