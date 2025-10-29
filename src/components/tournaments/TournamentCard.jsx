export default function TournamentCard({ data }) {
  const { id, name, desc, status, format, createdAt } = data;
  const badge =
    status === "reg" ? "tg-badge tg-badge-reg" :
    status === "live" ? "tg-badge tg-badge-live" : "tg-badge tg-badge-done";

  return (
    <div className="tg-card p-4">
      <div className="tg-card-top mb-3" />
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-lg line-clamp-1">{name}</h3>
        <span className={badge}>
          {status === "reg" ? "접수중" : status === "live" ? "진행중" : "종료"}
        </span>
      </div>

      <p className="text-sm text-gray-300 line-clamp-2">{desc}</p>

       {/* ⬇️ 여기 클래스 추가 */}
      <div className="tg-footer">
        <span className="tg-stage">
          {format === "se" ? "Single Elim" : format === "de" ? "Double Elim" : format?.toUpperCase() || "Format"}
        </span>
        <a className="tg-btn tg-btn-ghost" href={`/tournaments/${id}`}>자세히 보기 →</a>
      </div>
    </div>
  );
}
