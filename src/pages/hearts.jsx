import React from 'react';
import SEO from '../components/seo';
import Hearts from '../containers/hearts';
import 'animate.css/source/_base.css';
import 'animate.css/source/fading_entrances/fadeIn.css';
import 'animate.css/source/fading_exits/fadeOut.css';
import 'animate.css/source/fading_entrances/fadeInUp.css';
import 'animate.css/source/fading_exits/fadeOutDown.css';

const HeartsPage = () => (
  <>
    <SEO title="Hearts Game" />
    <Hearts />
  </>
);

export default HeartsPage;
