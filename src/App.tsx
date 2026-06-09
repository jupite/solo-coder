import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import Home from "@/pages/Home";
import Reader from "@/pages/Reader";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/reader" element={<Reader />} />
        </Route>
      </Routes>
    </Router>
  );
}
