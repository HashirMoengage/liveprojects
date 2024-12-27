import React from "react";
import { Link } from "react-router-dom";

interface RegionLinkProps {
  regionCode: string;
  regionName: string;
}

const RegionLink: React.FC<RegionLinkProps> = ({ regionCode, regionName }) => {
  return (
    <div className="region-link">
      <Link to={`/projects/${regionCode}`}>{regionName}</Link>
    </div>
  );
};

export default RegionLink;
