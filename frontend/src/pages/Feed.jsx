import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils/UserContext";
import UserCard from "../components/UserCard";

const Feed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();

  // Route Guard
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchFeed = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/feed");
      if (!response.ok) {
        throw new Error("Failed to fetch feed profiles");
      }
      const data = await response.json();
      
      // Filter out the logged-in user from the feed
      const filteredFeed = data.filter((item) => item._id !== user?._id);
      setFeed(filteredFeed);
    } catch (err) {
      setError(err.message || "Could not load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const handleLike = (likedUser) => {
    console.log("Liked developer:", likedUser.firstName);
    // Move to next card
    setFeed((prevFeed) => prevFeed.slice(1));
  };

  const handleDislike = (dislikedUser) => {
    console.log("Ignored developer:", dislikedUser.firstName);
    // Move to next card
    setFeed((prevFeed) => prevFeed.slice(1));
  };

  if (!user) return null;

  return (
    <div className="feed-container">
      {loading ? (
        <div className="glass-card feed-message-card">
          <div className="feed-message-title">Finding developers...</div>
          <div className="feed-message-subtitle">Scanning the database</div>
        </div>
      ) : error ? (
        <div className="glass-card feed-message-card">
          <div className="feed-message-title">Error Loading Feed</div>
          <div className="feed-message-subtitle">{error}</div>
          <button className="btn-primary" onClick={fetchFeed} style={{ marginTop: "1rem" }}>
            Try Again
          </button>
        </div>
      ) : feed.length === 0 ? (
        <div className="glass-card feed-message-card">
          <div className="feed-message-title">You've seen everyone!</div>
          <div className="feed-message-subtitle">There are no other profiles nearby. Check back later.</div>
          <button className="btn-primary" onClick={fetchFeed} style={{ marginTop: "1.5rem" }}>
            Refresh Feed
          </button>
        </div>
      ) : (
        <UserCard 
          user={feed[0]} 
          onLike={handleLike} 
          onDislike={handleDislike} 
        />
      )}
    </div>
  );
};

export default Feed;
