import { Fragment } from "react";
import "./AuthForm.css";

export default function AuthForm({
                                     title,
                                     fields,
                                     onSubmit,
                                     submitText,
                                     extraButton
                                 }) {
    return (
        <main className="auth-section">
            <h2 className="auth-title">{title}</h2>

            <form className="auth-box" onSubmit={onSubmit}>
                {fields.map(({ id, label, type, value, onChange, helpMessage }) => (
                    <Fragment key={id}>
                        <label htmlFor={id}>{label}</label>
                        <input
                            id={id}
                            type={type}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={helpMessage}
                            required
                        />
                    </Fragment>
                ))}
                <button type="submit" className="auth-btn">
                    {submitText}
                </button>
            </form>

            {extraButton}
        </main>
    );
}