import { Routes, Route } from 'react-router-dom';
import { LoginView } from './pages/LoginView';
import { HomeView } from './pages/HomeView';
import { Loading } from './components/Loading';
import { GuestRoute } from './router/GuestRoute';
import { ProtectedRoute } from './router/ProtectedRoute';
import { Paths } from './router/paths';

function App() {
  return (
    <div className="w-full mx-auto">
      <Routes>
        {/* Login Page - Guest Only */}
        <Route
          path={Paths.LOGIN}
          element={
            <GuestRoute>
              {(authenticating) =>
                authenticating ? <Loading /> : <LoginView />
              }
            </GuestRoute>
          }
        />

        {/* Home Page - Protected */}
        <Route
          path={Paths.HOME}
          element={
            <ProtectedRoute>
              {(user, authenticating) =>
                authenticating ? <Loading /> : <HomeView user={user} />
              }
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
