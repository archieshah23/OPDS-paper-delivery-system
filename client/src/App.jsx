import { Route, Routes } from "react-router-dom";
import { Admin } from "./pages/Admin";
import { ClgAdmin } from "./pages/ClgAdmin";
import { ClgDean } from "./pages/ClgDean";
import { CollegeRegister } from "./pages/CollegeRegister";
import { ErrorPage } from "./pages/ErrorPage";
import { LoginForm } from "./pages/LoginForm";
import { Registration } from "./pages/Registration";
import { Supervisor } from "./pages/Supervisor";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Registration />}></Route>
      <Route path="/login" element={<LoginForm />}></Route>
      <Route path="/clg-register" element={<CollegeRegister />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/supervisor" element={<Supervisor />} />
      <Route path="/clg-admin" element={<ClgAdmin />} />
      <Route path="/clg-dean" element={<ClgDean />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};
