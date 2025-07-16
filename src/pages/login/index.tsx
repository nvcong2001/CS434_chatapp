import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useState } from "react";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(
        auth,
        email as string,
        password as string
      );
      toast.success("Login successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email as string,
        password as string
      );

      await setDoc(doc(db, "users", res.user.uid), {
        username: username as string,
        email: email as string,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("Register successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-screen h-full flex items-center justify-evenly">
      <div className="flex flex-col items-center gap-5">
        <h2 className="font-extrabold text-3xl">WelCome Back,</h2>
        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center gap-5"
        >
          <input
            className="p-5 outline-0 bg-black/45 rounded-lg"
            type="text"
            placeholder="Email"
            name="email"
          />
          <input
            className="p-5 outline-0 bg-black/45 rounded-lg"
            type="password"
            placeholder="Password"
            name="password"
          />
          <button
            disabled={loading}
            className="disabled:cursor-not-allowed disabled:opacity-50 bg-blue-400 w-full py-4 rounded-lg hover:bg-blue-600 font-bold"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="h-[80%] w-0.5 bg-white/50"></div>

      <div className="item">
        <h2 className="font-extrabold text-3xl mb-5">Create an Account</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <input
            className="p-5 outline-0 bg-black/45 rounded-lg"
            type="text"
            placeholder="Username"
            name="username"
          />
          <input
            className="p-5 outline-0 bg-black/45 rounded-lg"
            type="email"
            placeholder="Email"
            name="email"
          />
          <input
            className="p-5 outline-0 bg-black/45 rounded-lg"
            type="password"
            placeholder="Password"
            name="password"
          />
          <button
            disabled={loading}
            className="disabled:cursor-not-allowed disabled:opacity-50 bg-blue-400 w-full py-4 rounded-lg hover:bg-blue-600 font-bold"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
