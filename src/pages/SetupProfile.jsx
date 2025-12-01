// src/pages/SetupProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { updateProfile, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const RANKS = [
  ...Array.from({ length: 18 }, (_, i) => `${18 - i}급`),
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}단`),
];

const STAMINA_MAP = {
  "18급": 0, "17급": 50, "16급": 100, "15급": 150, "14급": 200,
  "13급": 250, "12급": 300, "11급": 350, "10급": 400, "9급": 450,
  "8급": 500, "7급": 550, "6급": 600, "5급": 650, "4급": 700,
  "3급": 750, "2급": 800, "1급": 850,
  "1단": 1000, "2단": 1100, "3단": 1200, "4단": 1300, "5단": 1400,
  "6단": 1500, "7단": 1600, "8단": 1700, "9단": 1800,
};

const NAME_MIN = 2;
const NAME_MAX = 16;
const BIO_MAX = 140;
const MAX_IMAGE_MB = 5;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// 복현기우회 ‘몇 대’ 선택 옵션 (1~100)
const GENERATIONS = Array.from({ length: 100 }, (_, i) => i + 1);
const DEFAULT_GENERATION = 49;

export default function SetupProfile() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // 상태
  const [realName, setRealName] = useState("");
  const [rank, setRank] = useState("18급");
  const [bio, setBio] = useState("");
  const [generation, setGeneration] = useState(DEFAULT_GENERATION);

  // ✅ 알림 수신: 단일 동의 토글
  const [notifyAll, setNotifyAll] = useState(true);

  // 동의(개별) + 다이얼로그
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const POLICY_VERSION = "v1.0";

  // 이미지
  const defaultPhotoURL = "/images/바통이.jpg";
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // UX
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [nameAvailable, setNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);

  // 파생
  const staminaValue = STAMINA_MAP[rank] ?? STAMINA_MAP["1단"];
  const startingRating = 1500;

  // 이미지 처리
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      alert("이미지 파일만 업로드할 수 있어요 (png, jpg, webp, gif).");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      alert(`이미지 용량은 최대 ${MAX_IMAGE_MB}MB까지 가능합니다.`);
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  async function uploadPhotoIfNeeded(uid) {
    try {
      if (photoFile && storage) {
        const key = `profile/${uid}/${Date.now()}_${photoFile.name}`;
        const storageRef = ref(storage, key);
        await uploadBytes(storageRef, photoFile);
        return await getDownloadURL(storageRef);
      }
    } catch (e) {
      console.warn("사진 업로드 실패. 기본/프리뷰 사용:", e);
    }
    return photoPreview || defaultPhotoURL || user?.photoURL || "";
  }

  // 이름 중복 검사
  useEffect(() => {
    if (!realName || realName.length < NAME_MIN) {
      setNameAvailable(null);
      return;
    }
    const t = setTimeout(async () => {
      setCheckingName(true);
      try {
        const q = query(collection(db, "users"), where("name", "==", realName));
        const snap = await getDocs(q);
        const existsOther = snap.docs.filter((d) => d.id !== user?.uid).length > 0;
        setNameAvailable(!existsOther);
      } catch (e) {
        console.warn("이름 중복 확인 실패:", e);
        setNameAvailable(null);
      } finally {
        setCheckingName(false);
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realName]);

  // 유효성 검사
  const validate = () => {
    const err = {};
    const ban = /[<>/\\{}[\]|`~]/;

    if (!realName || realName.length < NAME_MIN || realName.length > NAME_MAX || ban.test(realName)) {
      err.realName = `이름은 ${NAME_MIN}~${NAME_MAX}자, 특수문자(< > / \\ { } [ ] | \` ~) 불가`;
    }
    if (!RANKS.includes(rank)) err.rank = "유효한 기력을 선택하세요.";
    if (bio.length > BIO_MAX) err.bio = `소개는 최대 ${BIO_MAX}자입니다.`;
    if (!Number.isInteger(Number(generation)) || generation < 1 || generation > 100) {
      err.generation = "복현기우회 ‘몇 대’는 1~100 사이의 숫자여야 합니다.";
    }
    if (!agreedTerms) err.agreedTerms = "이용약관에 동의해야 합니다.";
    if (!agreedPrivacy) err.agreedPrivacy = "개인정보 처리방침에 동의해야 합니다.";
    if (nameAvailable === false) err.realName = "이미 사용 중인 이름입니다.";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const photoURL = await uploadPhotoIfNeeded(user.uid);
      const now = serverTimestamp();

      // displayName = 실명
      await updateProfile(user, { displayName: realName, photoURL });

      const batch = writeBatch(db);
      const userRef = doc(db, "users", user.uid);
      const matchRef = doc(db, "matchApplications", `${realName}_${user.uid}`);

      batch.set(
        userRef,
        {
          uid: user.uid,
          email: user.email || "",
          name: realName,
          rank,
          bio: bio.trim(),
          photoURL,
          // ✅ 공개/리그 필드 제거
          generation: Number(generation),
          generationLabel: `${Number(generation)}대`,
          consent: {
            version: POLICY_VERSION,
            terms: { agreed: true, agreedAt: now },
            privacy: { agreed: true, agreedAt: now },
          },
          // ✅ 알림: 단일 동의만
          notificationsEnabled: !!notifyAll,

          // 기타 기본값
          points: 0,
          mileage: 10000,
          role: "member",
          admin: false,
          chosenTitle: "",
          title: "",
          Boss: [],
          BossCompleted: [],
          missionCompleted_입문: [],
          missionCompleted_초급: [],
          missionCompleted_중급: [],
          missionCompleted_고급: [],
          nameColor: "black",
          nicknameColor: "black",
          createdAt: now,
          lastLogin: now,
        },
        { merge: true }
      );

      batch.set(
        matchRef,
        {
          playerName: realName,
          stamina: staminaValue,
          rating: startingRating,
          win: 0,
          loss: 0,
          winRate: 0,
          createdAt: now,
        },
        { merge: true }
      );

      await batch.commit();
      navigate("/");
    } catch (error) {
      console.error("프로필 저장 중 오류:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 약관/개인정보 다이얼로그 공통 UI
  const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          zIndex: 50,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(720px, 96vw)",
            maxHeight: "86vh",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
            <button
              onClick={onClose}
              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <div style={{ padding: 18, overflow: "auto" }}>
            {children}
          </div>
          <div style={{ padding: 14, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={onClose}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "48px auto",
        padding: 28,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          padding: "6px 12px",
          backgroundColor: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 2px 6px rgba(0,0,0,.2)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
      >
        로그아웃
      </button>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          textAlign: "center",
          color: "#2563eb",
          marginBottom: 22,
        }}
      >
        프로필 설정
      </h2>

      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            fontSize: 14,
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>{String(v)}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        {/* 이름(실명) */}
        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
            이름(실명) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="예: 홍길동"
            required
            aria-invalid={!!errors.realName}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
            {checkingName
              ? "이름 중복 확인 중..."
              : nameAvailable === true
              ? "사용 가능한 이름입니다."
              : nameAvailable === false
              ? "이미 사용 중인 이름입니다."
              : `영문/한글 ${NAME_MIN}~${NAME_MAX}자 권장`}
          </div>
        </div>

        {/* 기력 */}
        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
            기력 <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            aria-invalid={!!errors.rank}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              background: "white",
            }}
          >
            {RANKS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
            예상 스태미너: <b>{staminaValue}</b> / 시작 레이팅: <b>1500</b>
          </div>
        </div>

        {/* 소개 */}
        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
            소개(선택, {BIO_MAX}자 이내)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={BIO_MAX}
            placeholder="예: 공격적이고 전투적인 스타일을 좋아합니다!"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
            {bio.length}/{BIO_MAX}
          </div>
        </div>

        {/* 프로필 사진 */}
        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
            프로필 사진
          </label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: "100%", fontSize: 14 }} />
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src={photoPreview || defaultPhotoURL}
              alt="프로필 미리보기"
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: "2px solid #2563eb",
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                flex: "0 0 auto",
              }}
            />
            <div style={{ fontSize: 12, color: "#64748b" }}>
              PNG/JPG/WebP/GIF, 최대 {MAX_IMAGE_MB}MB
            </div>
          </div>
        </div>

        {/* ✅ (삭제됨) 프로필 공개 / 리그 참가 — 요청대로 제거 */}

        {/* 알림 수신: 단일 토글 */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>알림 수신</div>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={notifyAll}
              onChange={(e) => setNotifyAll(e.target.checked)}
            />
            모든 알림 동의
          </label>
        </div>

        {/* 복현기우회 ‘몇 대’ */}
        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
            복현기우회 ‘몇 대’ <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={generation}
            onChange={(e) => setGeneration(Number(e.target.value))}
            aria-invalid={!!errors.generation}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              background: "white",
            }}
          >
            {GENERATIONS.map((g) => (
              <option key={g} value={g}>{g}대</option>
            ))}
          </select>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
            기본값은 {DEFAULT_GENERATION}대입니다. 실제 기수를 선택하세요.
          </div>
        </div>

        {/* 약관/개인정보 동의 + 다이얼로그 링크 */}
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
            약관 및 개인정보 처리방침 동의 <span style={{ color: "#ef4444" }}>*</span>
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
            <span>
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                style={{ color: "#2563eb", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                이용약관
              </button>
              에 동의합니다.
            </span>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
            />
            <span>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                style={{ color: "#2563eb", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                개인정보 처리방침
              </button>
              에 동의합니다.
            </span>
          </label>

          {(errors.agreedTerms || errors.agreedPrivacy) && (
            <div style={{ fontSize: 12, color: "#b91c1c" }}>
              {errors.agreedTerms || errors.agreedPrivacy}
            </div>
          )}
        </div>

        {/* 제출 */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "12px",
            background: submitting
              ? "linear-gradient(to right, #94a3b8, #a1a1aa)"
              : "linear-gradient(to right, #3b82f6, #6366f1)",
            color: "white",
            fontWeight: 700,
            borderRadius: 10,
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            fontSize: 16,
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.35)",
            transition: "filter .15s ease",
          }}
          onMouseOver={(e) => !submitting && (e.currentTarget.style.filter = "brightness(0.95)")}
          onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
        >
          {submitting ? "저장 중..." : "저장하고 시작하기"}
        </button>
      </form>

      {/* 약관 다이얼로그 */}
      <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="이용약관">
        <p style={{ color: "#334155", lineHeight: 1.6 }}>
          복현기우회 동아리 웹사이트의 이용약관은 아래와 같습니다:
          <br /><br />
          1. 서비스 이용: 회원은 본 웹사이트에서 제공하는 서비스를 선의로 이용해야 합니다. 불법/유해 행위는 금지됩니다.
          <br /><br />
          2. 개인정보 보호: 회원의 개인정보는 회원 관리 및 서비스 제공 목적 범위 내에서만 이용됩니다.
          <br /><br />
          3. 서비스 변경/중지: 서비스 내용은 사전 예고 없이 변경 또는 중지될 수 있습니다.
          <br /><br />
          4. 면책: 서비스 이용 과정에서 발생한 손해에 대해 동아리는 법적 책임을 지지 않습니다.
        </p>
      </Modal>

      {/* 개인정보 처리방침 다이얼로그 */}
      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="개인정보 처리방침">
        <p style={{ color: "#334155", lineHeight: 1.6 }}>
          복현기우회 동아리는 회원의 개인정보를 아래와 같이 처리합니다:
          <br /><br />
          1. 수집 항목: 이름, 이메일 등 회원 식별에 필요한 최소 정보
          <br /><br />
          2. 이용 목적: 회원 관리, 서비스 제공 및 개선
          <br /><br />
          3. 보유 기간: 탈퇴 시까지(관련 법령에 따라 일부 보관 가능)
          <br /><br />
          4. 안전성 확보: 암호화·접근통제 등 보호조치 적용
          <br /><br />
          5. 제3자 제공: 법령이 허용하는 경우 또는 사전 동의가 있는 경우에 한함
        </p>
      </Modal>
    </div>
  );
}
