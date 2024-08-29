import React from 'react';
import { StyledLink } from './styles';

const About: React.FC = () => {
  return (
    <div>
      <h2>About</h2>
      <p>
        <StyledLink href="https://www.linkedin.com/in/dima-gurevich-7b184194/" target="_blank">
          <i className="fab fa-linkedin"></i> LinkedIn
        </StyledLink>
        <StyledLink href="https://github.com/dimag25" target="_blank">
          <i className="fab fa-github"></i> GitHub
        </StyledLink>
      </p>
    </div>
  );
};

export default About;