import React, { useRef } from 'react';
import useScrollSpy from 'react-use-scrollspy';
import SEO from '../components/seo';
import Layout from '../components/porfolio/layout';
import Navbar from '../components/porfolio/navbar';
import Hero from '../components/porfolio/hero';
import Skills from '../components/porfolio/skills';
import Experiences from '../components/porfolio/experiences';
import RecentWorks from '../components/porfolio/recent-works';
import ContactForm from '../components/porfolio/contact-form';
import Footer from '../components/porfolio/footer';

const IndexPage = () => {
  const sectionRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    offsetPx: -150,
  });

  return (
    <Layout>
      <SEO title="Home" />
      <Navbar activeSection={activeSection} />
      <Hero ref={sectionRefs[0]} />
      <Skills ref={sectionRefs[1]} />
      <Experiences ref={sectionRefs[2]} />
      <RecentWorks ref={sectionRefs[3]} />
      <ContactForm ref={sectionRefs[4]} />
      <Footer />
    </Layout>
  );
};

export default IndexPage;
