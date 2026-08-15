import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./Pages/AuthPages/SignIn";
import SignUp from "./Pages/AuthPages/SignUp";
import NotFound from "./Pages/OtherPage/NotFound";
import UserProfiles from "./Pages/UserProfiles";
import Videos from "./Pages/UiElements/Videos";
import Images from "./Pages/UiElements/Images";
import Alerts from "./Pages/UiElements/Alerts";
import Badges from "./Pages/UiElements/Badges";
import Avatars from "./Pages/UiElements/Avatars";
import Buttons from "./Pages/UiElements/Buttons";
import LineChart from "./Pages/Charts/LineChart";
import BarChart from "./Pages/Charts/BarChart";
import Calendar from "./Pages/Calendar";
import BasicTables from "./Pages/Tables/BasicTables";
import FormElements from "./Pages/Forms/FormElements";
import Blank from "./Pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./Pages/Dashboard/Home";

export default function TailAdminApp() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
