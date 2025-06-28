// src/pages/Lecture/입문Flow.jsx
import React, { useState } from 'react';
import { 입문Steps } from './입문Steps';
import LessonStep from './LessonStep';
import './Lecture.css';

export default function 입문Flow() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 입문Steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert('🎉 입문 강의를 모두 완료했습니다! 축하합니다!');
    }
  };

  return (
    <div className="lecture-page">
      <div className="lecture-card">
        <h1 className="lecture-title">
          📚 입문자 강의
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
            max={입문Steps.length}
            aria-label="강의 진행률"
          />
          <p className="lecture-progress-text">
            {currentStep + 1} / {입문Steps.length} 단계
          </p>
        </div>

        <LessonStep
          lesson={입문Steps[currentStep]}
          onNext={handleNext}
          isLast={currentStep === 입문Steps.length - 1}
        />
      </div>
    </div>
  );
}
