export default function RegisterForm({ form, onChange }) {
  const phoneDigits = (form.phone_number || '').replace(/\D/g, '');
  const phoneLocalNumber = phoneDigits.startsWith('91') ? phoneDigits.slice(2) : phoneDigits;

  const handlePhoneChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '');
    const localNumber = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;

    onChange({
      target: {
        name: 'phone_number',
        type: 'text',
        value: localNumber ? `91${localNumber.slice(0, 10)}` : '',
      },
    });
  };

  return (
    <div className="auth-grid">
      <label>
        <span>Business Name</span>
        <input name="business_name" type="text" placeholder="Acme Inc." className="form-control-custom" value={form.business_name || ''} onChange={onChange} required />
      </label>
      <label>
        <span>First Name</span>
        <input name="first_name" type="text" placeholder="John" className="form-control-custom" value={form.first_name || ''} onChange={onChange} required />
      </label>
      <label>
        <span>Last Name</span>
        <input name="last_name" type="text" placeholder="Doe" className="form-control-custom" value={form.last_name || ''} onChange={onChange} required />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" placeholder="you@company.com" className="form-control-custom" value={form.email || ''} onChange={onChange} required />
      </label>
      <label>
        <span>Phone Number</span>
        <div className="phone-input-group">
          <div className="phone-prefix">+91</div>
          <input
            name="phone_number"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength="10"
            placeholder="xxxxxxxxxx"
            className="form-control-custom"
            value={phoneLocalNumber}
            onChange={handlePhoneChange}
            required
          />
        </div>
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" placeholder="********" className="form-control-custom" value={form.password || ''} onChange={onChange} required />
      </label>
      <label>
        <span>Confirm Password</span>
        <input name="confirm_password" type="password" placeholder="********" className="form-control-custom" value={form.confirm_password || ''} onChange={onChange} required />
      </label>
    </div>
  );
}
