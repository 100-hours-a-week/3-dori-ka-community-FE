import "./Pagination.css";

export default function Pagination({ totalPages, currentPage, onChange }) {
    if (totalPages <= 1) return null;

    const maxButtons = 5;
    const currentGroup = Math.floor(currentPage / maxButtons);
    const groupStart = currentGroup * maxButtons;
    const groupEnd = Math.min(groupStart + maxButtons, totalPages);

    const pages = [];
    for (let i = groupStart; i < groupEnd; i++) {
        pages.push(
            <button
                key={i}
                className={"mp-page" + (currentPage === i ? " is-active" : "")}
                onClick={() => onChange(i)}
            >
                {i + 1}
            </button>
        );
    }

    return (
        <div className="mp-pagination">
            <button
                className="mp-page-nav"
                disabled={currentGroup === 0}
                onClick={() => onChange((currentGroup - 1) * maxButtons)}
            >
                ◀
            </button>

            {pages}

            <button
                className="mp-page-nav"
                disabled={groupEnd >= totalPages}
                onClick={() => onChange(groupEnd)}
            >
                ▶
            </button>

            <select
                className="mp-page-select"
                value={currentPage}
                onChange={(e) => onChange(Number(e.target.value))}
            >
                {[...Array(totalPages).keys()].map((i) => (
                    <option key={i} value={i}>
                        {i + 1}
                    </option>
                ))}
            </select>
        </div>
    );
}