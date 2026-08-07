const UserCard = ({ user, onLike, onDislike }) => {
  if (!user) return null;

  // Generate fallback skills based on age for demo purposes
  const mockSkills = [
    ["React", "NodeJS", "JavaScript", "MongoDB"],
    ["Python", "Django", "PostgreSQL", "Docker"],
    ["HTML", "CSS", "UI/UX", "Figma"],
    ["Golang", "Kubernetes", "GraphQL", "Redis"],
    ["Java", "Spring Boot", "MySQL", "AWS"],
  ];
  
  const skillIndex = (user.age || 20) % mockSkills.length;
  const skills = mockSkills[skillIndex];

  return (
    <div className="user-card">
      <div className="user-card-image-placeholder">
        <div className="user-card-avatar-text">
          {user.firstName[0].toUpperCase()}
        </div>
        <div className="user-card-gender-badge">
          {user.gender || "developer"}
        </div>
      </div>

      <div className="user-card-info">
        <h3 className="user-card-name-age">
          {user.firstName} {user.lastName || ""}, <span>{user.age || "N/A"}</span>
        </h3>
        <p className="user-card-email">{user.email}</p>

        <p className="user-card-skills-title">Primary Stack</p>
        <div className="user-card-skills-list">
          {skills.map((skill, index) => (
            <span key={index} className="user-card-skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="user-card-actions">
        <button 
          className="btn-action btn-action-dislike" 
          onClick={() => onDislike(user)}
          title="Ignore"
          style={{ fontSize: "1rem", fontWeight: 600 }}
        >
          Pass
        </button>
        <button 
          className="btn-action btn-action-like" 
          onClick={() => onLike(user)}
          title="Connect"
          style={{ fontSize: "1rem", fontWeight: 600 }}
        >
          Like
        </button>
      </div>
    </div>
  );
};

export default UserCard;
