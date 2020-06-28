interface FieldProps {
  name: string,
  label: string,
  type: string,
  autoComplete: string,
  required: boolean,
}

export default function field({ name, label, type, autoComplete, required }: FieldProps) {

  return (
    <div className="field">
      <input
        autoComplete={autoComplete}
        id={[name, 'input'].join('-')}
        name={name}
        required={required}
        type={type}
        placeholder=" "
        className="mat-input"
      />
      <label className="mat-label" id={[name, 'label'].join('-')} htmlFor={[name, 'input'].join('-')}>
        {label}
      </label>
    </div>
  )
}
