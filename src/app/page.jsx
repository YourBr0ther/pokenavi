import styles from './page.module.css'
import Image from "next/image"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
         <div>Continue the Adventure with your favorite sidekicks</div>
         <div>PokeNavi, a new way to interact with your favorite Pokemon using artifical intelligence to bring them to life.</div>
         <button className={styles.button}> Sign Up </button>
      </div>
      <div className={styles.item}>
        <Image className={styles.img} src="" alt="homepage.png"></Image>
      </div>
    </div>
  )
}
