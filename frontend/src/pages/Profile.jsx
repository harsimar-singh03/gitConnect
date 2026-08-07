import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils/UserContext";

const Profile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Guard Clause and pre-fill form
  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setAge(user.age || "");
      setGender(user.gender || "male");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          age: age ? Number(age) : undefined,
          gender,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.data);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      let cleanMsg = err.message || "Something went wrong";
      if (cleanMsg.startsWith("ERROR: ")) {
        cleanMsg = cleanMsg.replace("ERROR: ", "");
      }
      setError(cleanMsg);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="glass-card">
        <div className="profile-header">
          <h2>Edit Profile</h2>
          <p>Update your details so other developers can find you</p>
        </div>

        {error && <div className="alert-error">⚠️ {error}</div>}
        {success && <div className="profile-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                className="form-control"
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

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="text"
              className="form-control"
              value={user.email}
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>

          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
