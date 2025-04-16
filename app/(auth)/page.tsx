import LoginForm from "@/components/login-form";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-3 shadow-md">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="white" />
                <path d="M12 6L8 8V16L12 18L16 16V8L12 6Z" fill="#3B82F6" />
                <path d="M12 10L10 11V13L12 14L14 13V11L12 10Z" fill="white" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TeamFlow</h1>
          <p className="mt-2 text-gray-600">
            Gespecialiseerde chatapplicatie voor scrum-teams
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
