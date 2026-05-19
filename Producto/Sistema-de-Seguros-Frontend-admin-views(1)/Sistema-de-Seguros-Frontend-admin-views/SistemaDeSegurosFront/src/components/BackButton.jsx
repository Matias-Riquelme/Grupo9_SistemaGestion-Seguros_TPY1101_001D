import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            className="btn-back"
            onClick={() => navigate(-1)}
            title="Volver atrás"
        >
            <span className="material-icons">arrow_back</span>
            Volver
        </button>
    );
}

export default BackButton;
