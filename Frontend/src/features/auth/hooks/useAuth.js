
import { useContext,useEffect } from "react";
import { AuthContext } from "../authContext";
import { login, logout, register, getMe } from "../services/auth.api";


export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      const userData = data?.user || (data?.id || data?.username ? { id: data.id, username: data.username, email: data.email } : null);
      if (userData) {
        setUser(userData);
      }
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      const userData = data?.user || (data?.id || data?.username ? { id: data.id, username: data.username, email: data.email } : null);
      if (userData) {
        setUser(userData);
      }
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
      const getAndSetUser = async () => {
        try {
          const data = await getMe(); 
            setUser(data.user);
          }
          catch (err) {
        } finally {
          setLoading(false);
        }
        } 
      
      getAndSetUser();
  }, [setUser, setLoading]);

  return { user, loading, handleRegister, handleLogin, handleLogout };
};
