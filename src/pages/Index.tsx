import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Landing from "./Landing";
import Hero from "@/components/Hero";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Si se accede desde /fiscalizar, hacer scroll al formulario
    if (location.pathname === '/fiscalizar' || location.search.includes('scroll=form')) {
      setTimeout(() => {
        const formSection = document.getElementById('registration-form');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  return (
    <>
      <Hero />
      <Landing />
    </>
  );
};

export default Index;
