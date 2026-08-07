import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils/UserContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");

  const { user, setUser } = useUser();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // Login API Call
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error || "Login failed");
        }

        setUser(data.user);
        navigate("/feed");
      } else {
        // Signup API Call
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            age: age ? Number(age) : undefined,
            gender,
          }),
        });

        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(responseText || "Registration failed");
        }

        // Auto-login after successful signup
        const loginResponse = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          setUser(loginData.user);
          navigate("/feed");
        } else {
          // If auto login fails, send back to login screen
          setIsLogin(true);
          setError("Account created! Please log in.");
        }
      }
    } catch (err) {
      // Extract clean error message (handling "ERROR: " prefix if returned by backend)
      let cleanMsg = err.message || "Something went wrong";
      if (cleanMsg.startsWith("ERROR: ")) {
        cleanMsg = cleanMsg.replace("ERROR: ", "");
      }
      setError(cleanMsg);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <div className="auth-header">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>{isLogin ? "Connect with top developers today" : "Join the developer network"}</p>
        </div>

        {error && (
          <div className="alert-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-control"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-control"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    className="form-control"
                    placeholder="25"
                    min="18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    className="form-control"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              New to gitConnect?{" "}
              <span onClick={() => { setIsLogin(false); setError(""); }}>Sign Up</span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span onClick={() => { setIsLogin(true); setError(""); }}>Log In</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
