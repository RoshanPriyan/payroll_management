export default function AdminDashboardPage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <iframe
      title="Super Admin Dashboard"
      src={`/admin-dashboard.html?apiBaseUrl=${encodeURIComponent(apiBaseUrl || '')}`}
      style={{
        width: '100%',
        height: '100vh',
        border: 0,
        display: 'block',
      }}
    />
  );
}
