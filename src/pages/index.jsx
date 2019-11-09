import React, { useRef } from 'react';
import useScrollSpy from 'react-use-scrollspy';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Navbar from '../components/navbar';
import Hero from '../components/hero';
import Skills from '../components/skills';
import Experiences from '../components/experiences';
import ContactForm from '../components/contact-form';
import Footer from '../components/footer';

const IndexPage = () => {
  const sectionRefs = [
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
      <ContactForm ref={sectionRefs[3]} />
      <Footer />
    </Layout>
  );
};

export default IndexPage;
