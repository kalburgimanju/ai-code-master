import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";

export default function App() {
  const { isAuthenticated, email, accounts, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gmail-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <Layout email={email} accounts={accounts} onLogout={logout} onAddAccount={login} />;
}
