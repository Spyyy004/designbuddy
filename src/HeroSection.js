// HeroSection.js
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
mixpanel.init('3c2b5ecba43167fc94001a0b2ce32da5');
const HeroSection = () => {

    const navigate = useNavigate();

    const handleGetStarted = () => {
      // Track the button click with Mixpanel
      mixpanel.track('Get Started Clicked', {
        section: 'Hero',
        message: 'User clicked on Get Started button',
      });

      // Redirect to the form screen
      navigate('/designcasestudyform');
    };

  return (
    <HeroContainer>
      <AnimatedBackground>
        <motion.div
          className="blob"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="blob"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </AnimatedBackground>
      <HeroContent>
        <motion.h1 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3, duration: 1 }}
        >
          Transform Your Design Process
        </motion.h1>
        <motion.p 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.5, duration: 1 }}
        >
          Elevate your results with beautiful, AI-powered case studies
        </motion.p>
        <motion.button 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.7, duration: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleGetStarted}
        >
          Get Started
        </motion.button>
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;

// Styled Components for the Hero Section
const HeroContainer = styled.div`
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  color: white;
  background-color: #282c34;
`;

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;

  .blob {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,95,109,1) 0%, rgba(255,195,113,1) 100%);
    position: absolute;
    border-radius: 50%;
    opacity: 0.8;
    animation: blob-move 20s infinite;
  }

  .blob:nth-child(1) {
    top: 10%;
    left: 20%;
  }

  .blob:nth-child(2) {
    bottom: 10%;
    right: 20%;
  }

  @keyframes blob-move {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(100px, -100px);
    }
  }
`;

const HeroContent = styled.div`
  text-align: center;
  z-index: 1;

  h1 {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.5rem;
    margin-bottom: 40px;
  }

  button {
    padding: 15px 30px;
    background: linear-gradient(45deg, #FF6F61, #FF8A65);
    color: white;
    font-size: 1.2rem;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: transform 0.3s ease;
    z-index: 1;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
  }
`;
