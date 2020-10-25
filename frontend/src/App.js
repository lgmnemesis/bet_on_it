import React, {useState, useEffect } from 'react';
import getBlockchain from './ethereum';
import { Pie } from 'react-chartjs-2';

const SIDE = {
  BIDEN: 0,
  TRUMP: 1
}

function App() {
  const [betPredictions, setBetPredictions] = useState(undefined);
  const [predictionMarket, setPredictionMarket] = useState(undefined);
  const [myBets, setMyBets] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        const {signerAddress, predictionMarket} = await getBlockchain();
        console.log('moshe:', predictionMarket);

        const bets = await Promise.all([
          predictionMarket.bets(SIDE.BIDEN),
          predictionMarket.bets(SIDE.TRUMP)
        ]);
        const betPredictions = {
          labels: [
            'Trump',
            'Biden',
          ],
          datasets: [{
            data: [bets[1].toString(), bets[0].toString()],
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
            ],
            hoverBackgroundColor: [
              '#FF6384',
              '#36A2EB',
            ]
          }]
        };
        const myBetsInit = await Promise.all([
        predictionMarket.betsPerGambler(signerAddress, SIDE.BIDEN),
        predictionMarket.betsPerGambler(signerAddress, SIDE.TRUMP)
        ]);
        setBetPredictions(betPredictions);
        setPredictionMarket(predictionMarket);
        setMyBets(myBetsInit);
      } catch (error) {
        console.error(error);  
      }
    };
    init();
  }, [])

  const placeBet = async (e, side) => {
    e.preventDefault();
    await predictionMarket.placeBet(
      side, 
      {value: e.target.elements[0].value}
    );
  };

  const withdrawGain = async (e) => {
    e.preventDefault();
    await predictionMarket.withdrawGain();
  };

  if (
    typeof predictionMarket === 'undefined'
    || typeof myBets === 'undefined'
    || typeof betPredictions === 'undefined'
  ) {
    return <p>Loading...</p>;
  }

  return (
     <div className='container'>
      <div className='row'>
        <div className='col-sm-12'>
          <h1 className='text-center'>Prediction Market</h1>
          <div className="jumbotron">
            <h1 className="display-4 text-center">Who will win the US election?</h1>
            <p className="lead text-center">Current odds</p>
            <div>
               <Pie data={betPredictions} />
            </div>
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-sm-6'>
          <div className="card">
            <img src='./img/trump.png' alt='Trump'/>
            <div className="card-body">
              <h5 className="card-title">Trump</h5>
              <form className="form-inline" onSubmit={e => placeBet(e, SIDE.TRUMP)}>
                <input 
                  type="text" 
                  className="form-control mb-2 mr-sm-2" 
                  placeholder="Bet amount (ether)"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary mb-2"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className='col-sm-6'>
          <div className="card">
            <img src='./img/biden.png' alt='Biden'/>
            <div className="card-body">
              <h5 className="card-title">Biden</h5>
              <form className="form-inline" onSubmit={e => placeBet(e, SIDE.BIDEN)}>
                <input 
                  type="text" 
                  className="form-control mb-2 mr-sm-2" 
                  placeholder="Bet amount (ether)"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary mb-2"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className='row'>
        <h2>Your bets</h2>
        <ul>
          <li>Biden: {myBets[0].toString()} ETH (wei)</li>
          <li>Trump: {myBets[1].toString()} ETH (wei)</li>
        </ul>
      </div>

      <div className='row'>
        <h2>Claim your gains, if any, after the election</h2>
        <button 
          type="submit" 
          className="btn btn-primary mb-2"
          onClick={e => withdrawGain(e)}
        >
          Submit
        </button>
      </div>

    </div>
  );
}

export default App;
