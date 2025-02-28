import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function Header() {
  return (
    <header></header>
     
  
  );
}

function HeroBanner() {
  return (
    <div >
      
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description="Help center for Avana">
      <Header />
      <HeroBanner />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
