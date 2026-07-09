import React from "react";
import Banner from "../components/Home/Banner";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import Testimonial from "../components/Home/Testimonial";
import CallToAction from "../components/Home/CallToAction";
import Footer from "../components/Home/Footer";
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>AI Resume Builder | Free ATS-Friendly Resume Builder</title>
        <meta
          name="description"
          content="Create professional ATS-friendly resumes online in minutes. Choose beautiful templates and download your resume as PDF."
        />
      </Helmet>
      <div>
        <Banner />
        <Hero />
        <Features />
        <Testimonial />
        <CallToAction />
        <Footer />
      </div>
    </>
  );
};

export default Home;
