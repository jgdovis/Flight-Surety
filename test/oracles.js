
var Test = require('../config/testConfig.js');
const FlightSuretyData = artifacts.require("FlightSuretyData");
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
contract('Oracles', async (accounts) => {

  before('setup contract', async () => {
    
  });

  const TEST_ORACLES_COUNT = 20;
  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_AIRLINE = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;
  const owner = accounts[0];
  it("can register oracles", async() => {

      let instanceApp = await FlightSuretyApp.deployed();
      let fee = await instanceApp.REGISTRATION_FEE.call();

      for(let a=1; a<=TEST_ORACLES_COUNT; a++) {
          await instanceApp.registerOracle({from: accounts[a], value: fee});
          let result = await instanceApp.getMyIndexes.call({from: accounts[a]});
          console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
      }
      let isOracle1Reg = await instanceApp.getOracleInfo(accounts[1], {from:owner});
      assert.equal(isOracle1Reg[0], true);
      let isOracle5Reg = await instanceApp.getOracleInfo(accounts[5], {from:owner});
      assert.equal(isOracle5Reg[0], true);

  });

  it("checks if the first airline can send funds to the contract and change its 'isFunded' state", async() => {
      let instanceApp = await FlightSuretyApp.deployed();
      let airlineFee = await web3.utils.toWei("10", "ether");
      let airlineBalanceBefore = await web3.eth.getBalance(owner);
      await instanceApp.fundAirline({from: owner, value: airlineFee});
      let contractBalance = await instanceApp.getContractBalance.call();
      let airlineBalanceAfter = await web3.eth.getBalance(owner);
      assert.isAbove(Number(airlineBalanceBefore) - Number(airlineBalanceAfter), Number(airlineFee));
      let airline = await instanceApp.getAirline.call(owner);
      let isFunded = airline[3];
      assert.equal(isFunded, true);
  });

  it("enables a funded airline to register a flight", async() => {
      let instanceApp = await FlightSuretyApp.deployed();
      let airline1 = owner;
      let airline1Details = await instanceApp.getAirline.call(airline1);
      
      assert.equal(airline1Details[3], true);
      let dateString = "2020-11-11T11:11:00Z"
      let departureDate = new Date(dateString).getTime();
     
      await instanceApp.registerFlight("AA 1122", "WAW", "LON", departureDate, {from:airline1});
      let numFlights = await instanceApp.howManyFlights.call();
      
      assert.equal(numFlights, 1);
      let flightHash = await instanceApp.getFlightKey.call(airline1, "AA 1122", departureDate);
      let flightInfo = await instanceApp.getFlight(flightHash);
      
      assert.equal(flightInfo[0], "AA 1122");
      
      assert.equal(flightInfo[3], true);
      assert.equal(flightInfo[4], false);
      assert.equal(flightInfo[6], departureDate);
      assert.equal(flightInfo[7], airline1);
  });

  it('can request flight status', async () => {
      let instanceApp = await FlightSuretyApp.deployed();
      let flight = 'AA 1122'; // flight code
      let dateString = "2020-11-11T11:11:00Z"
      let departureDate = new Date(dateString).getTime();
      //Submit a request for oracles to get status information for a flight
      await instanceApp.fetchFlightStatus(owner, flight, departureDate);

      var numResponses = 0;
      for(let a=1; a<=TEST_ORACLES_COUNT; a++) {
      
      let oracleIndexes = await instanceApp.getMyIndexes.call({ from: accounts[a]});

      try {
    
        await instanceApp.submitOracleResponse(oracleIndexes[0], owner, flight, departureDate, STATUS_CODE_ON_TIME, { from: accounts[a] });
        numResponses+=1;
   
        } catch(e) {
  
          console.log(`\nOracle no. ${a} not chosen`, 0, oracleIndexes[0].toNumber(), flight, departureDate);
        }
    }
    console.log("Num valid responses: ", numResponses)
    if (numResponses >= 3) {
       
        let flightHash = await instanceApp.getFlightKey(owner, flight, departureDate);
        let flightInfo = await instanceApp.getFlight(flightHash);
        console.log("Flight code: ", flightInfo[0]);
        console.log("Status code: ", Number(flightInfo[3]));
        assert.equal(flightInfo[0], "AA 1122");
        assert.equal(flightInfo[3], STATUS_CODE_ON_TIME);
    }

  });


});