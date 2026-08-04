import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import SignIn from "./pages/SigninPage";
import SignUp from "./pages/SignupPage";
import ChatApp from "./pages/ChatApp";
import ProtectedRoute from "./components/auth/protectedRoute";
import { useThemeStore } from "./stores/useThemeStore";
import { useEffect } from "react";

function App() {
  const { isDark, setTheme } = useThemeStore();
  // khi đóng tab hoặc load lại trang thì sẽ lưu lại trạng thái của theme
  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

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
