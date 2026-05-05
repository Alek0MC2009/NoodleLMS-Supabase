// pages/Landing.tsx
import Header from "../components/common/Header";
import { Hero } from "../components/common/Hero"; // ✅ Con llaves porque es export function

function Landing() {
  return (
    <div>
      <Header />
      <Hero />
    </div>
  );
}

export default Landing;
