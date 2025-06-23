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
    color: "#1e3a8a", // 인디고 톤
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: "8px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "24px",
    marginBottom: "8px",
    color: "#0f172a", // 어두운 남색 계열
  },
  paragraph: {
    fontSize: "16px",
    marginBottom: "16px",
  },
};

const PrivacyPolicy = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>개인정보 처리방침</h1>
      <p style={styles.paragraph}>
        복현기우회 동아리는 회원의 개인정보를 아래와 같이 처리합니다:
      </p>

      <h2 style={styles.sectionTitle}>1. 개인정보 수집</h2>
      <p style={styles.paragraph}>
        복현기우회 동아리는 회원가입 시 필요한 최소한의 개인정보를 수집합니다.
        수집되는 개인정보는 이름, 이메일 주소 등입니다.
      </p>

      <h2 style={styles.sectionTitle}>2. 개인정보 이용 목적</h2>
      <p style={styles.paragraph}>
        수집된 개인정보는 회원 관리와 서비스 제공을 위한 목적으로만 사용됩니다.
        그 외의 목적으로는 사용되지 않습니다.
      </p>

      <h2 style={styles.sectionTitle}>3. 개인정보 보유 및 이용 기간</h2>
      <p style={styles.paragraph}>
        회원의 개인정보는 회원이 탈퇴하거나 서비스가 종료될 때까지 보유됩니다.
        단, 법적 의무나 사정에 따라 일정 기간 보유할 수 있습니다.
      </p>

      <h2 style={styles.sectionTitle}>4. 개인정보의 안전성</h2>
      <p style={styles.paragraph}>
        복현기우회 동아리는 회원의 개인정보 보호를 위해 기술적, 관리적 보호 조치를 취하고 있습니다.
        개인정보는 암호화 처리되어 안전하게 관리됩니다.
      </p>

      <h2 style={styles.sectionTitle}>5. 개인정보 제공</h2>
      <p style={styles.paragraph}>
        복현기우회 동아리는 회원의 개인정보를 외부에 제공하지 않으며,
        제3자에게 제공할 경우 사전 동의를 받습니다.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
