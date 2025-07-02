// src/pages/Lecture/격언Flow.jsx

import React, { useState } from 'react';
import { 격언Steps } from './격언Steps';
import LessonStep from './LessonStep';
import './Lecture.css';

export default function 격언Flow() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 격언Steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert('🎉 바둑 격언 강의를 모두 완료했습니다! 축하합니다!');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="lecture-page">
      <div className="lecture-card">
        <h1 className="lecture-title">
          📖 바둑 격언 강의
          <span className="lecture-subtitle">단계별 진행</span>
        </h1>

        <div className="lecture-progress">
          <label htmlFor="progress" className="sr-only">
            강의 진행률
          </label>
          <progress
            id="progress"
            className="lecture-progress-bar"
            value={currentStep + 1}
            max={격언Steps.length}
            aria-label="강의 진행률"
          />
          <p className="lecture-progress-text">
            {currentStep + 1} / {격언Steps.length} 단계
          </p>
        </div>

        <LessonStep
          lesson={격언Steps[currentStep]}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentStep === 0}
          isLast={currentStep === 격언Steps.length - 1}
        />
      </div>
    </div>
  );
}
