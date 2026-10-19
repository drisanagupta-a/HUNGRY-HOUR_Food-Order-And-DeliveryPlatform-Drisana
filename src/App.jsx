import { Route, Routes } from "react-router-dom";

function SetupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">HUNGRY HOUR</h1>
      <p className="text-lg">Food Ordering and Delivery Platform</p>
      <p className="text-sm text-gray-600">
        Project setup completed successfully.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
    </Routes>
  );
}
