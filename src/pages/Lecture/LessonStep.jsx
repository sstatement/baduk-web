import React from 'react';

const LessonStep = ({ lesson, onNext, isLast }) => {
  return (
    <div className="lesson-step-container bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>

      {lesson.image && (
        Array.isArray(lesson.image) ? (
          <div className="lesson-image-group">
            {lesson.image.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`${lesson.title} 이미지 ${index + 1}`}
                className="lesson-image"
              />
            ))}
          </div>
        ) : (
          <img
            src={lesson.image}
            alt={lesson.title}
            className="lesson-image single-image"
          />
        )
      )}

      <p className="mb-4">{lesson.text}</p>

      <div className="bg-gray-100 p-3 mb-4 rounded">
        <strong>질문:</strong> {lesson.question}
      </div>

      <details className="mb-4 cursor-pointer">
        <summary className="text-blue-600 underline">정답 보기</summary>
        <p className="mt-2">{lesson.answer}</p>
      </details>

      <button className="lesson-btn" onClick={onNext}>
        {isLast ? '완료' : '다음'}
      </button>
    </div>
  );
};

export default LessonStep;
