import clsx from "clsx";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";
import { Server, Code, Cloud, Users, Database } from "lucide-react";

const FeatureList = [
  {
    title: "Back End",
    icon: <Server size={24} color="#1E40AF" />, // Deep blue
    description:
      "Learn about AWS Lambda and API Gateway. Understand how serverless functions work, how to deploy and manage them, and how API Gateway enables secure and scalable API access.",
    link: "/docs/category/backend-API",
    color: "#DBEAFE", // Light blue
  },
  {
    title: "Front End",
    icon: <Code size={24} color="#B45309" />, // Deep orange
    description:
      "HTML, JS Files (Instructions to modify key values). Learn how to customize and manage the frontend components efficiently.",
    link: "/docs/category/Front-End",
    color: "#FEF3C7", // Light yellow
  },
  {
    title: "Event Bridge & Lambda",
    icon: <Cloud size={24} color="#6B21A8" />, // Deep purple
    description:
      "Learn how to set up EventBridge schedules and sync with AWS Lambda for automated task execution and event-driven workflows.",
    link: "/docs/category/Event-Bridge",
    color: "#E9D5FF", // Light purple
  },
  {
    title: "Cognito User Management",
    icon: <Users size={24} color="#0F766E" />, // Teal
    description:
      "Learn how to set up AWS Cognito User Pools, manage authentication, and migrate users securely.",
    link: "/docs/category/CognitoUserPool",
    color: "#CCFBF1", // Light teal
  },
  {
    title: "DynamoDB Import Setup",
    icon: <Database size={24} color="#92400E" />, // Brown
    description:
      "Learn how to set up and import data into Amazon DynamoDB, ensuring efficient storage, indexing, and scalability.",
    link: "/docs/category/DynamoDB",
    color: "#FDE68A", // Light yellow
  },
];

function Feature({ icon, title, description, link, color }) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <div className={styles.featureCard} style={{ backgroundColor: color }}>
        <div className={styles.featureHeader}>
          <div className={styles.featureIconWrapper}>{icon}</div>
          <h3 className={styles.featureTitle}>{title}</h3>
        </div>
        <p className={styles.featureDescription}>{description}</p>
        <div className={styles.featureLink}>
          <Link to={link}>See More</Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
