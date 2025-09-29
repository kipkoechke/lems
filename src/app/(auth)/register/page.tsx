export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">Register</h1>
        <p className="text-center text-gray-600">
          Registration form would go here
        </p>
        <div className="mt-6 text-center">
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
