import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="intern" />
        <div className="external-shadow">
          <div className="central">
            <img src="favicon.png" alt="Logo" width="70%" height="70%" />
          </div>
        </div>
      </div>
      <h1>LOADING...</h1>
    </StyledWrapper>
    
  );
};

const StyledWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color:rgb(0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: center;

  .loader {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10em;
    height: 10em;
  }

  .external-shadow {
    width: 10em;
    height: 10em;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background-color: rgb(0, 0, 0);
    box-shadow: 
      0.5em 0.5em 3em blueviolet,
      -0.5em 0.5em 3em blue,
      0.5em -0.5em 3em purple,
      -0.5em -0.5em 3em cyan;
    z-index: 2;
    animation: rotate 3s linear infinite;
    transform: scale(1.5);
  }

  .central {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 10em;
    height: 10em;
    border-radius: 50%;
    
    box-shadow: 
      0.5em 1em 1em blueviolet,
      -0.5em 0.5em 1em blue,
      0.5em -0.5em 1em purple,
      -0.5em -0.5em 1em cyan;
    background-color:rgb(0, 0, 0);
    z-index: 3;
  }

  .central img {
    object-fit: contain;
    filter: drop-shadow(0 0 0px black);
  }

  .intern {
    position: absolute;
    color: white;
    z-index: 9999;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg) scale(1.5);
    }
    50% {
      transform: rotate(180deg) scale(1.5);
    }
    100% {
      transform: rotate(360deg) scale(1.5);
    }
  }
    h1 {
        font-family: 'Franklin Gothic Medium';
        position: absolute;
        color: white;
        font-size: 2rem;
        text-align: center;
        top: 90%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: fadeIn 2s ease-in-out;
        aniamation-direction: alternate;
        animation-iteration-count: infinite;
    }
    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
`;

export default Loader;
