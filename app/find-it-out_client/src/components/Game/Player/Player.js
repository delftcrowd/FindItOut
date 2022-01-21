import React from "react";

const Player = ({ username, ...props }) => {

  return (
    <div className="Player" {...props}>
      <img src="user.svg" alt="UserAvatar. Icon made by www.flaticon.com" />
      <span>{username}</span>
    </div>
  )
}

export default React.memo(Player);