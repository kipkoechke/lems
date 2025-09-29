export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
