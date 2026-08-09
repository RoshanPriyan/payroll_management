export default function LoginForm({ form, onChange }) {
  return (
    <>
      <label>
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="you@company.com"
          className="form-control-custom"
          value={form.email || ''}
          onChange={onChange}
          required
        />
      </label>
      <label>
        <span>Password</span>
        <input
          name="password"
          type="password"
          placeholder="********"
          className="form-control-custom"
          value={form.password || ''}
          onChange={onChange}
          required
        />
      </label>
      <div className="auth-options">
        <label className="auth-checkbox">
          <input type="checkbox" name="remember" checked={Boolean(form.remember)} onChange={onChange} />
          Remember Me
        </label>
        <a href="#">Forgot Password?</a>
      </div>
    </>
  );
}
