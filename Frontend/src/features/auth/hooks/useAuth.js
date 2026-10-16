
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
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
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
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
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
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
      const getAndSetUser = async () => {
        try {
          const data = await getMe(); 
          if (data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
        catch (err) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      } 
      
      getAndSetUser();
  }, [setUser, setLoading]);

  return { user, loading, handleRegister, handleLogin, handleLogout };
};
