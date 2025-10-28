// src/pages/members.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './members.css';

/** 이름 → 고유 HSL 색상 (아바타용) */
const hueFromString = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
};
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '🙂';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/** 역할 메타 */
const ROLE_META = {
  admin: { label: '관리자', icon: '🔱', order: 0, className: 'role-admin' },
  staff: { label: '스태프', icon: '🛠', order: 1, className: 'role-staff' },
  member: { label: '일반', icon: '🙂', order: 2, className: 'role-member' },
};
const getRoleMeta = (role) => ROLE_META[role] ?? ROLE_META.member;

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI 상태
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [view, setView] = useState('card'); // 'card' | 'table'
  const [sortKey, setSortKey] = useState('role'); // 'role' | 'name' | 'date'
  const [page, setPage] = useState(1);
  const perPage = 12;

  const inputRef = useRef(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const membersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const ts = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
          const createdAt = ts ? ts.toLocaleDateString() : '불명';
          return {
            id: doc.id,
            name: data.name || '이름 없음',
            role: data.role || 'member',
            createdAt,
            createdAtDate: ts,
          };
        });
        setMembers(membersData);
      } catch (error) {
        console.error('회원 목록 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // 필터/검색
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => (roleFilter === 'all' ? true : m.role === roleFilter))
      .filter((m) => (q ? m.name.toLowerCase().includes(q) : true));
  }, [members, roleFilter, query]);

  // 정렬
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === 'name') {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortKey === 'date') {
      arr.sort((a, b) => {
        const ad = a.createdAtDate ? a.createdAtDate.getTime() : 0;
        const bd = b.createdAtDate ? b.createdAtDate.getTime() : 0;
        return bd - ad; // 최신 가입순
      });
    } else {
      arr.sort(
        (a, b) =>
          getRoleMeta(a.role).order - getRoleMeta(b.role).order ||
          a.name.localeCompare(b.name)
      );
    }
    return arr;
  }, [filtered, sortKey]);

  // 페이지네이션
  const maxPage = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1); // 필터/검색/정렬 변경 시 1페이지로
  }, [query, roleFilter, sortKey]);

  const renderRibbon = (createdAtDate) => {
    if (!createdAtDate) return null;
    const today = new Date();
    const years =
      today.getFullYear() -
      createdAtDate.getFullYear() -
      (today < new Date(today.getFullYear(), createdAtDate.getMonth(), createdAtDate.getDate())
        ? 1
        : 0);
    if (years >= 3) return <span className="ribbon ribbon-gold">원년멤버</span>;
    if (years >= 1) return <span className="ribbon ribbon-silver">{years}년차</span>;
    const diffDays = Math.floor((today - createdAtDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return <span className="ribbon ribbon-new">NEW</span>;
    return null;
  };

  if (loading)
    return (
      <div className="members-center">
        <div className="loader" aria-label="로딩 중" />
        <p className="members-loading">회원 목록을 불러오는 중...</p>
      </div>
    );

  return (
    <div className="members-wrap">
      <div className="members-shell">
        {/* 헤더 */}
        <header className="members-hero glass">
          <div className="hero-left">
            <div className="title-row">
              <h1 className="members-title">회원 목록</h1>
              <span className="hero-badge">Live</span>
            </div>
            <p className="members-sub">각자의 컬러와 역할, 그리고 합류 스토리를 한눈에</p>
          </div>
          {/*<div className="hero-actions">
            <button className="btn ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              ⬆ 맨위로
            </button>
            <button className="btn primary" onClick={() => inputRef.current?.focus()}>
              🔎 검색
            </button>
          </div> */}
        </header>

        {/* 컨트롤 바 */}
        <section className="members-controls glass" role="region" aria-label="목록 필터 및 보기 전환">
          {/* 검색 */}
          <div className="control search">
            <span className="ico">🔎</span>
            <input
              ref={inputRef}
              className="input"
              placeholder="이름으로 검색…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="이름 검색"
            />
            {query && (
              <button
                className="clear"
                aria-label="검색어 지우기"
                onClick={() => setQuery('')}
                title="지우기"
              >
                ×
              </button>
            )}
          </div>

          {/* 역할 필터 칩 */}
          <div className="control chips" role="tablist" aria-label="역할 필터">
            {[
              { v: 'all', label: '전체' },
              { v: 'admin', label: '관리자' },
              { v: 'staff', label: '스태프' },
              { v: 'member', label: '일반' },
            ].map(({ v, label }) => (
              <button
                key={v}
                role="tab"
                aria-selected={roleFilter === v}
                className={`chip ${roleFilter === v ? 'active' : ''}`}
                onClick={() => setRoleFilter(v)}
              >
                {v !== 'all' ? <span className="chip-ico">{getRoleMeta(v).icon}</span> : '🌈'}
                {label}
              </button>
            ))}
          </div>

          {/* 정렬 & 보기 전환 */}
          <div className="control right">
            <div className="select">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                aria-label="정렬 기준"
              >
                <option value="role">역할 우선</option>
                <option value="name">이름순</option>
                <option value="date">최신 가입순</option>
              </select>
              <span className="caret">▾</span>
            </div>

            <div className="segmented">
              <button
                className={`seg ${view === 'card' ? 'on' : ''}`}
                aria-pressed={view === 'card'}
                onClick={() => setView('card')}
                title="카드 보기"
              >
                🗂 카드
              </button>
              <button
                className={`seg ${view === 'table' ? 'on' : ''}`}
                aria-pressed={view === 'table'}
                onClick={() => setView('table')}
                title="테이블 보기"
              >
                📋 테이블
              </button>
            </div>
          </div>
        </section>

        {/* 콘텐츠 */}
        {view === 'card' ? (
          <section className="members-grid">
            {paged.length > 0 ? (
              paged.map((m) => {
                const hue = hueFromString(m.name);
                const meta = getRoleMeta(m.role);
                return (
                  <article
                    key={m.id}
                    className="member-card glass tilt"
                    aria-label={`${m.name} 카드`}
                    tabIndex={0}
                  >
                    {renderRibbon(m.createdAtDate)}
                    <div
                      className="member-avatar"
                      style={{
                        background: `conic-gradient(from 0deg, hsl(${hue} 85% 60%), hsl(${(hue + 40) % 360} 80% 55%), hsl(${(hue + 300) % 360} 85% 58%))`,
                      }}
                      aria-hidden="true"
                    >
                      <span className="member-initials">{getInitials(m.name)}</span>
                    </div>

                    <div className="member-body">
                      <div className="member-name-row">
                        <h3 className="member-name">{m.name}</h3>
                        <span className={`role-chip ${meta.className}`} title={meta.label}>
                          <span className="role-ico">{meta.icon}</span>
                          {meta.label}
                        </span>
                      </div>

                      <div className="member-meta">
                        <span className="meta-item">가입일: {m.createdAt}</span>
                      </div>

                      <div className="member-tags" aria-label="멤버 태그">
                        <span className="tag">팀워크</span>
                        <span className="tag">{meta.label}</span>
                        <span className="tag">리그 참여</span>
                      </div>
                    </div>

                    {/*<footer className="card-actions">
                      <button className="btn ghost small">프로필</button>
                      <button className="btn primary small">메시지</button>
                    </footer>*/}
                  </article>
                );
              })
            ) : (
              <div className="empty">
                <div className="empty-illu">🧩</div>
                <p>조건에 맞는 회원이 없습니다.</p>
              </div>
            )}
          </section>
        ) : (
          <section className="table-wrap glass">
            {paged.length > 0 ? (
              <table className="members-table" role="table" aria-label="회원 테이블">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>등급</th>
                    <th>가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m) => {
                    const meta = getRoleMeta(m.role);
                    const hue = hueFromString(m.name);
                    return (
                      <tr key={m.id} className="row">
                        <td>
                          <div className="cell-name">
                            <div
                              className="cell-avatar"
                              style={{
                                background: `linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${(hue + 40) % 360} 80% 58%))`,
                              }}
                              aria-hidden="true"
                            >
                              {getInitials(m.name)}
                            </div>
                            <span className="cell-text">{m.name}</span>
                            {renderRibbon(m.createdAtDate)}
                          </div>
                        </td>
                        <td>
                          <span className={`members-chip ${meta.className}`}>
                            <span className="role-ico">{meta.icon}</span>
                            {meta.label}
                          </span>
                        </td>
                        <td>{m.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <div className="empty-illu">🔍</div>
                <p>가입된 회원이 없습니다.</p>
              </div>
            )}
          </section>
        )}

        {/* 페이지네이션 */}
        {sorted.length > perPage && (
          <nav className="pagination glass" aria-label="페이지네이션">
            <button
              className="btn ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ◀ 이전
            </button>
            <span className="page-indicator">
              {page} / {maxPage}
            </span>
            <button
              className="btn primary"
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page === maxPage}
            >
              다음 ▶
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Members;
