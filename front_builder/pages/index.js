import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>SpecTry App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to SpecTry !
        </h1>

        <p className={styles.description}>
          Choose a project to start with.
        </p>
      </main>

      <footer className={styles.footer}>
        SpecTry
      </footer>
    </div>
  )
}
