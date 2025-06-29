// src/pages/Lecture/끝내기Flow.jsx

import React, { useState } from 'react';
import { 끝내기Steps } from './끝내기Steps';
import LessonStep from './LessonStep';
import './Lecture.css';

export default function 끝내기Flow() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 끝내기Steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert('🎉 끝내기 강의를 모두 완료했습니다! 축하합니다!');
    }
  };

  return (
    <div className="lecture-page">
      <div className="lecture-card">
        <h1 className="lecture-title">
          📚 끝내기 강의
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
            max={끝내기Steps.length}
            aria-label="강의 진행률"
          />
          <p className="lecture-progress-text">
            {currentStep + 1} / {끝내기Steps.length} 단계
          </p>
        </div>

        <LessonStep
          lesson={끝내기Steps[currentStep]}
          onNext={handleNext}
          isLast={currentStep === 끝내기Steps.length - 1}
        />
      </div>
    </div>
  );
}
