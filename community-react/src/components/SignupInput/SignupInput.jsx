import "./SignupInput.css";

export default function SignupInput({
                                      label,
                                      id,
                                      type = "text",
                                      value,
                                      onChange,
                                      placeholder,
                                      error,
                                      maxLength,
                                  }) {
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="helper-text error">{error}</p>
        </>
    );
}