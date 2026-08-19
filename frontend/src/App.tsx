import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import SignIn from "./pages/SigninPage";
import SignUp from "./pages/SignupPage";
import ChatApp from "./pages/ChatApp";
import ProtectedRoute from "./components/auth/protectedRoute";
import { useThemeStore } from "./stores/useThemeStore";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useSocketStore } from "./stores/useSocketStore";

function App() {
  const { isDark, setTheme } = useThemeStore();
  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  // khi đóng tab hoặc load lại trang thì sẽ lưu lại trạng thái của theme
  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if (accessToken) {
      connectSocket();
    }

    return () => disconnectSocket(); // khi đóng tab hoặc load lại trang thì sẽ ngắt kết nối socket
  }, [accessToken]);

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* protectect routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
