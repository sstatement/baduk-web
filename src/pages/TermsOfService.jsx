import React from "react";

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "32px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: "1.7",
    color: "#333",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "24px",
    color: "#1e3a8a", // 인디고 계열
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: "8px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "24px",
    marginBottom: "8px",
    color: "#0f172a", // 짙은 회색-남색
  },
  paragraph: {
    fontSize: "16px",
    marginBottom: "16px",
  },
};

const TermsOfService = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>이용약관</h1>
      <p style={styles.paragraph}>
        복현기우회 동아리 웹사이트의 이용약관은 아래와 같습니다:
      </p>

      <h2 style={styles.sectionTitle}>1. 서비스 이용</h2>
      <p style={styles.paragraph}>
        회원은 본 웹사이트에서 제공하는 다양한 서비스를 자유롭게 이용할 수 있습니다.
        다만, 불법적인 활동이나 사회적 해악을 끼치는 행위는 금지되며, 이에 대한 책임은 회원에게 있습니다.
      </p>

      <h2 style={styles.sectionTitle}>2. 개인정보 보호</h2>
      <p style={styles.paragraph}>
        복현기우회 동아리는 회원의 개인정보 보호를 매우 중요하게 생각합니다. 개인정보는 오직 회원 관리와 관련된 업무에만 사용되며, 외부에 유출되지 않도록 최선을 다합니다.
      </p>

      <h2 style={styles.sectionTitle}>3. 서비스 변경 및 중지</h2>
      <p style={styles.paragraph}>
        복현기우회 동아리는 서비스의 내용을 사전 예고 없이 변경하거나 중지할 수 있습니다. 이로 인해 발생하는 피해에 대해 동아리는 책임지지 않습니다.
      </p>

      <h2 style={styles.sectionTitle}>4. 면책조항</h2>
      <p style={styles.paragraph}>
        복현기우회 동아리는 서비스 이용 중 발생할 수 있는 문제에 대해 책임지지 않습니다. 서비스의 불완전함이나 문제 발생에 대해 법적 책임을 지지 않습니다.
      </p>
    </div>
  );
};

export default TermsOfService;
