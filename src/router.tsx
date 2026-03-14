import {
  createBrowserRouter,
  ScrollRestoration,
  Outlet,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Loader from "./components/ui/Loader";

const Home = lazy(() => import("./pages/Home"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));
const BudgetEstimator = lazy(() => import("./pages/BudgetEstimator"));
const Hotels = lazy(() => import("./pages/Hotels"));
const FoodGuide = lazy(() => import("./pages/FoodGuide"));
const TravelOptions = lazy(() => import("./pages/TravelOptions"));
const SafetyGuide = lazy(() => import("./pages/SafetyGuide"));
const BestTime = lazy(() => import("./pages/BestTime"));
const Weather = lazy(() => import("./pages/Weather"));
const ExploreMap = lazy(() => import("./pages/ExploreMap"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RootLayout = () => {
  return (
    <>
      <ScrollRestoration />
      <Navbar />
      <Suspense fallback={<Loader fullScreen />}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "planner", element: <TripPlanner /> },
      { path: "budget", element: <BudgetEstimator /> },
      { path: "hotels", element: <Hotels /> },
      { path: "food", element: <FoodGuide /> },
      { path: "transport", element: <TravelOptions /> },
      { path: "safety", element: <SafetyGuide /> },
      { path: "best-time", element: <BestTime /> },
      { path: "weather", element: <Weather /> },
      { path: "map", element: <ExploreMap /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
