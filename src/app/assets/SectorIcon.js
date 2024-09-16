import * as React from "react";

function SectorIcon(props) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 40 41" fill="none" {...props}>
      <path
        d="M6.666 35.571a3.21 3.21 0 01-2.354-.979 3.21 3.21 0 01-.979-2.354V13.904c0-.916.326-1.7.98-2.354a3.21 3.21 0 012.353-.979h6.667V7.238c0-.917.326-1.702.98-2.354a3.21 3.21 0 012.353-.98h6.667a3.21 3.21 0 012.354.98 3.21 3.21 0 01.98 2.354v3.333h6.666a3.21 3.21 0 012.354.98 3.21 3.21 0 01.98 2.354v18.333a3.21 3.21 0 01-.98 2.354 3.21 3.21 0 01-2.354.98H6.666zm0-3.333h26.667V13.904H6.666v18.334zm10-21.667h6.667V7.238h-6.667v3.333z"
        fill="#031026"
      />
    </svg>
  );
}

const MemoSectorIcon = React.memo(SectorIcon);
export default MemoSectorIcon;
