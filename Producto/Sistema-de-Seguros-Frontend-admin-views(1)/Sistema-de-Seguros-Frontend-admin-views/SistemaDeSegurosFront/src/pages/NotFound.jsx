import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="page-container" style={{ textAlign: "center", paddingTop: "80px" }}>
            <span className="material-icons" style={{ fontSize: "5rem", color: "var(--color-text-muted)" }}>
                error_outline
            </span>
            <h1 style={{ fontSize: "4rem", margin: "0.5rem 0", color: "var(--color-primary)" }}>404</h1>
            <h2 style={{ marginBottom: "0.5rem" }}>Página no encontrada</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
                La ruta que buscas no existe o fue movida.
            </p>
            <Link to="/" className="btn btn-primary">
                <span className="material-icons" style={{ fontSize: "1.1rem" }}>home</span>
                Volver al inicio
            </Link>
        </div>
    );
}

export default NotFound;
