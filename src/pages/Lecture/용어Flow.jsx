// src/pages/Lecture/용어Flow.jsx
import React, { useState } from 'react';
import { 용어Steps } from './용어Steps';
import LessonStep from './LessonStep';
import './Lecture.css';

export default function 용어Flow() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 용어Steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      alert('🎉 용어 강의를 모두 완료했습니다! 축하합니다!');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="lecture-page">
      <div className="lecture-card">
        <h1 className="lecture-title">
          📚 용어 강의
          <span className="lecture-subtitle">단계별 진행</span>
        </h1>

        <div className="lecture-progress">
          <label htmlFor="progress" className="sr-only">강의 진행률</label>
          <progress
            id="progress"
            className="lecture-progress-bar"
            value={currentStep + 1}
            max={용어Steps.length}
            aria-label="강의 진행률"
          />
          <p className="lecture-progress-text">
            {currentStep + 1} / {용어Steps.length} 단계
          </p>
        </div>

        <LessonStep
          lesson={용어Steps[currentStep]}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentStep === 0}
          isLast={currentStep === 용어Steps.length - 1}
        />
      </div>
    </div>
  );
}
