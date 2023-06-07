import React from 'react'
import styles from './page.module.css'

const GetPokeNavi = () => {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.title}>Create an Account</div>
        <div className={styles.content}>
          <form className={styles.form}>
            <input type="Username" placeholder="Username" className={styles.input}/>
            <input type="Email Address" placeholder="Email Address" className={styles.input}/>
            <input type="Display Name" placeholder="Display Name" className={styles.input}/>
            <input type="Age" placeholder="Age" className={styles.input}/>
            <input type="Gender" placeholder="Gender" className={styles.input}/>
          </form>
        </div>
        <button className={styles.submit}>Submit</button>
      </div>
    </div>
  )
}

export default GetPokeNavi