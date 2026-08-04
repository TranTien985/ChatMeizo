import type { ThemeState } from "@/types/store";
import {create} from "zustand";
import {persist} from "zustand/middleware";  // để khi load lại vẫn giữ nguyên trạng thái theme

export const useThemeStore = create<ThemeState>()(
  persist(
    (set,get) => ({
      isDark : false,

      toggleTheme: () => {
        const newValue = !get().isDark;
        set({isDark : newValue}); // set lại giá trị mới cho theme

        if(newValue) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      setTheme : (dark : boolean) => {
        set({isDark : dark});
        if(dark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }),
    {
      name: "theme-storage"
    }
  )
)