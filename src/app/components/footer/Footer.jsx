import React from 'react'
import styles from "./footer.module.css"
import Image from 'next/image'

const Footer = () => {
      return (
            <div>
                  <div className={styles.footerbar}>
                        <div>©2023 PokeNavi. All rights reserved</div>
                        <div className={styles.social}>
                              <Image src="/1.png" alt="PokeNavi Facebook" width={32} height={32}></Image>
                              <Image src="/2.png" alt="PokeNavi Instagram" width={32} height={32}></Image>
                              <Image src="/3.png" alt="PokeNavi Twitter" width={32} height={32}></Image>
                              <Image src="/4.png" alt="PokeNavi YouTube" width={32} height={32}></Image>
                        </div >
                  </div>
            </div >
      )

}

export default Footer