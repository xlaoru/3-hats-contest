import { signIn } from "@/auth";
import { signInWithCredentials } from "@/lib/actions/auth.action";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignIn() {
  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-7">Sign In</h1>
      <form
        className="space-y-4"
        action={async (formData: FormData) => {
          "use server";
          const result = await signInWithCredentials({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          });

          console.log(result);

          redirect(result.success ? "/" : "/sign-up");
        }}
      >
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
        >
          Sign In
        </button>
      </form>

      <p className="mt-5 text-sm text-gray-500 text-center">
        No account? <Link href="/sign-up">Sign Up</Link>
      </p>
      <div className="grid grid-cols-2 gap-3 mt-6">
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full text-black border border-black bg-none hover:bg-gray-200 py-2.5 rounded-lg transition-colors"
          >
            Login with GitHub
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full text-black border border-black bg-none hover:bg-gray-200 py-2.5 rounded-lg transition-colors"
          >
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
}