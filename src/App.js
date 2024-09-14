// src/App.js
import React from 'react';
import CaseStudyForm from './DesignCaseStudyForm.js';
import HeroSection from './HeroSection.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="App">
     <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/designcasestudyform" element={<CaseStudyForm />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
