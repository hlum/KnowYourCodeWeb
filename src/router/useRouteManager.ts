import { useNavigate } from 'react-router-dom';
import { Paths } from './paths';

export const useRouteManager = () => {
  const navigate = useNavigate();

  return {
    toHome: () => navigate(Paths.HOME),
    toLogin: () => navigate(Paths.LOGIN, { replace: true }),
  };
};
