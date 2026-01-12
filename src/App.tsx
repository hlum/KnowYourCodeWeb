import { Routes, Route } from 'react-router-dom';
import { LoginView } from './pages/LoginView';
import { HomeView } from './pages/HomeView';
import { ClassListView } from './pages/ClassListView';
import { ClassHomeworkListView } from './pages/ClassHomeworkListView';
import { HomeworkListView } from './pages/HomeworkListView';
import { HomeworkDetailView } from './pages/HomeworkDetailView';
import { QuestionsView } from './pages/QuestionsView';
import { ProfileView } from './pages/ProfileView';
import { DetailAverageScoreView } from './pages/DetailAverageScoreView';
import { Loading } from './components/Loading';
import { MainLayout } from './components/MainLayout';
import { GuestRoute } from './router/GuestRoute';
import { ProtectedRoute } from './router/ProtectedRoute';
import { Paths } from './router/paths';

function App() {
  return (
    <div className="w-full mx-auto min-h-screen app-bg">
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

        {/* Protected Routes with Tab Navigation */}
        <Route
          element={
            <ProtectedRoute>
              {(_user, authenticating) =>
                authenticating ? <Loading /> : <MainLayout />
              }
            </ProtectedRoute>
          }
        >
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
          <Route
            path={Paths.CLASSES}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <ClassListView user={user} />
                }
              </ProtectedRoute>
            }
          />
          <Route
            path={Paths.CLASS_HOMEWORKS}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <ClassHomeworkListView user={user} />
                }
              </ProtectedRoute>
            }
          />
          <Route
            path={Paths.HOMEWORKS}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <HomeworkListView user={user} />
                }
              </ProtectedRoute>
            }
          />
          <Route
            path={Paths.HOMEWORK_DETAIL}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <HomeworkDetailView user={user} />
                }
              </ProtectedRoute>
            }
          />
          <Route
            path={Paths.HOMEWORK_QUESTIONS}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <QuestionsView user={user} />
                }
              </ProtectedRoute>
            }
          />
          <Route
            path={Paths.PROFILE}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <ProfileView user={user} />
                }
              </ProtectedRoute>
            }
          />
          <Route
            path={Paths.DETAIL_AVERAGE_SCORE}
            element={
              <ProtectedRoute>
                {(user, authenticating) =>
                  authenticating ? <Loading /> : <DetailAverageScoreView user={user} />
                }
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
