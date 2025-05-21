import React from 'react';
import styled from 'styled-components';

const CargarTablas = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="wrapper">
          <div className="circle" />
          <div className="line-1" />
          <div className="line-2" />
          <div className="line-3" />
          <div className="line-4" />
        </div>
      </div>
    </StyledWrapper>
  );
}
const StyledWrapper = styled.div`
  .loader {
    position: relative;
    width: 900px;     /* más ancho */
    height: 250px;    /* más alto */
    margin-bottom: 10px;
    border: 1px solid #d3d3d3;
    padding: 25px;
    background-color: #e3e3e3;
    overflow: hidden;
  }

  .loader:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(
      110deg,
      rgba(227, 227, 227, 0) 0%,
      rgba(227, 227, 227, 0) 40%,
      rgba(227, 227, 227, 0.5) 50%,
      rgba(227, 227, 227, 0) 60%,
      rgba(227, 227, 227, 0) 100%
    );
    animation: gradient-animation_2 1.2s linear infinite;
  }

  .loader .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .loader .wrapper > div {
    background-color: #cacaca;
  }

  .loader .circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  .loader .button {
    display: inline-block;
    height: 40px;
    width: 100px;
  }

  .loader .line-1 {
    position: absolute;
    top: 20px;
    left: 100px;
    height: 14px;
    width: 200px;
  }

  .loader .line-2 {
    position: absolute;
    top: 50px;
    left: 100px;
    height: 14px;
    width: 300px;
  }

  .loader .line-3 {
    position: absolute;
    top: 100px;
    left: 0px;
    height: 14px;
    width: 100%;
  }

  .loader .line-4 {
    position: absolute;
    top: 130px;
    left: 0px;
    height: 14px;
    width: 96%;
  }

  @keyframes gradient-animation_2 {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;


export default CargarTablas;
