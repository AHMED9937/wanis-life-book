import { Navigate, Route, Routes } from 'react-router-dom';
import { APP_AUTH_PATH } from './routes/authPaths';
import { AppRoute } from './routes/AppRoute';
import { HomeRoute } from './routes/HomeRoute';

/**
 * `/` = public landing (guests & while Clerk loads)
 * `/app` = signed-in library & life books
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path={APP_AUTH_PATH} element={<AppRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
