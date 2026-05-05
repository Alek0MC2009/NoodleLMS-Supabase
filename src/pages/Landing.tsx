// pages/Landing.tsx
import Header from "../components/common/Header";
import { Hero } from "../components/common/Hero"; // ✅ Con llaves porque es export function
import Pricing from "./static/Pricing";

function Landing() {
  return (
    <div>
      <Header />
      <Hero />
      <Pricing />
    </div>
  );
}

export default Landing;
