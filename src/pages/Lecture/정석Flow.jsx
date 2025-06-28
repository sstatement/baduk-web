// src/pages/Lecture/정석Flow.jsx
import React, { useState } from 'react';
import { 정석Steps } from './정석Steps';
import LessonStep from './LessonStep';
import './Lecture.css';

export default function 정석Flow() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 정석Steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert('🎉 정석 강의를 모두 완료했습니다! 잘하셨습니다!');
    }
  };

  return (
    <div className="lecture-page">
      <div className="lecture-card">
        <h1 className="lecture-title">
          📚 정석 강의
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
            max={정석Steps.length}
            aria-label="강의 진행률"
          />
          <p className="lecture-progress-text">
            {currentStep + 1} / {정석Steps.length} 단계
          </p>
        </div>

        <LessonStep
          lesson={정석Steps[currentStep]}
          onNext={handleNext}
          isLast={currentStep === 정석Steps.length - 1}
        />
      </div>
    </div>
  );
}
