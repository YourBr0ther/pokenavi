import styles from './page.module.css'
import Image from "next/image"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
         <h1 className={styles.title}>Continue the adventure together.</h1>
         <p className={styles.desc}>PokeNavi, a new way to interact with your favorite Pokemon using artifical intelligence to bring them to life.</p>
         <button href="/getpokenavi" className={styles.signup}>Sign Up</button>
      </div>
      <div className={styles.item}>
        <Image className={styles.img} src="/homepage.gif" alt="a lovely beach paradise" width={430} height={240}></Image>
      </div>
    </div>
  )
}
