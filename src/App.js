
import './App.css';
import React, { useState } from 'react'
import { Typography, Grid, Button, TextField, Snackbar } from '@mui/material';
import { Line } from 'react-chartjs-2';
import Axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';
import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
const StyledLoader = styled(LoadingOverlay)`
  .MyLoader_overlay {
    background: #1da1f2;
  }
  &.MyLoader_wrapper--active {
    background: #1da1f2;
  }
`

function App() {
  const [Loading, setLoading] = useState(false)
  const [snackState, setSnackState] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [lables, setLabels] = useState([])
  const [data, setData] = useState([]);
  const [fastedAsteroid, setFastedAsteroid] = useState({ id: 1, speed: 15454.45454545 });
  const [closestAsteroid, setClosestAsteroid] = useState({ id: 2, distance: 48415.5455464545 });
  const state = {
    labels: lables,
    datasets: [
      {
        label: 'Asteroid Per Day',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: data
      }
    ]
  }
  const handleDateSubmit = (e) => {
    e.preventDefault();
    const startDate = e.target["startDate"].value;
    const endDate = e.target["endDate"].value;

    if(!startDate || !endDate){
      setSnackMsg('Please select vaild dates');
      setSnackState(true);
      return;
    }
    var cc = 1000*60*60*24*6;
    var a = new Date(startDate)
    var b = new Date(endDate)
    if(a.getTime() > b.getTime()){
      setSnackMsg('End Date is old then start date, please selete valid one');
      setSnackState(true);
      return; 
    }
    if(a.getTime() + cc < b.getTime() ){
      setSnackMsg('Start and end date can be of 7 days');
      setSnackState(true);
      return;
    }
    setLoading(true);
    Axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&detailed=false&api_key=DEMO_KEY`)
      .then(function (response) {
        let dates = Object.keys(response.data.near_earth_objects).sort((a, b) => {
          const aDate = new Date(a);
          const bDate = new Date(b);
          if (aDate < bDate) {
            return -1;
          }
          if (aDate > bDate) {
            return 1;
          }
          return 0;
        });
        const newLales = dates.map(date => `${date.split("-")[1]}-${date.split("-")[2]}`);
        const ed = dates.map(date => response.data.near_earth_objects[date]);
        var newData = ed.map(d => d.length)
        setLabels(newLales);
        setData(newData);
        const AllAst = [];
        var earthObj = ed;
        earthObj.forEach((a) => {

          a.forEach((b) => {
            AllAst.push({
              id: b.id,
              speed: b.close_approach_data[0].relative_velocity.kilometers_per_hour,
              closeDateTime: b.close_approach_data[0].close_approach_date_full,
              distance: b.close_approach_data[0].miss_distance.kilometers,
            })
          });
        });
        const fastedAst = AllAst.reduce((a, b) => {
          return Number(a.speed) < Number(b.speed) ? b : a;
        })
        const closestAst = AllAst.reduce((a, b) => {
          return new Date(a.closeDateTime) > new Date(b.closeDateTime) ? a : b;
        })
        setClosestAsteroid(closestAst);
        setFastedAsteroid(fastedAst);
        setLoading(false);
      })
      .catch(function (error) {
        // handle error
        setLoading(false);
        setSnackMsg('Request Faild')
        setSnackState(true);
      })
  }

  return (
    <div className="App">
        <Snackbar
        open={snackState}
        autoHideDuration={6000}
        message={snackMsg}
        onClose={()=>{setSnackState(false)}}
        action={
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={()=>{setSnackState(false)}}
            >
              <CloseIcon />
            </IconButton>
        }
      />
      <Grid container>
        <Grid item xs={12}>
          <div className="header">
            <Typography variant="h3" component="h4" className="Logo">
              Asteroid Neo Stats
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12}>
        <StyledLoader
            active={Loading}
            spinner
            text='Please Wait...'
            classNamePrefix='MyLoader_'
            > 
          <Grid container>
            <Grid item xs={4} className="leftSidebar">
              <form style={{textAlign:'center'}} onSubmit={(e) => { handleDateSubmit(e) }}>
                {/* Start Date : <br /><input name="startDate" type="date" /> <br /><br />
                End Date : <br /><input name="endDate" type="date" /><br /><br /> */}
                <TextField
                  name="startDate"
                  inputProps={{
                    type: "date"
                  }}
                  label="Start Date"
                />  <br /><br />
                <TextField
                  name="endDate"
                  inputProps={{
                    type: "date"
                  }}
                  label="End Date"
                /> <br /><br />
                <Button type="submit" variant="outlined"> Submit </Button>
              </form><br /><br />
              {fastedAsteroid ?
                <div><Typography style={{textAlign:'center'}} variant="h5" component="h5">Fasted Asteroid </Typography>
                  <Typography style={{textAlign:'center'}} variant="h6" component="h6" >{fastedAsteroid.id} ({fastedAsteroid.speed} KM/H) </Typography><br /><br /> </div>
                : null}
              {closestAsteroid ?
                <div><Typography style={{textAlign:'center'}} variant="h5" component="h5" >Closest Asteroid  </Typography>
                  <Typography style={{textAlign:'center'}} variant="h6" component="h6" >{closestAsteroid.id} ({closestAsteroid.distance} KM)  </Typography><br /><br /> </div>
                : null}
            </Grid>
            <Grid item xs={8} className="contentArea">
              <Line
                data={state}
                options={{
                  title: {
                    display: true,
                    text: 'Asteroid per Day',
                    fontSize: 20
                  },
                  legend: {
                    display: true,
                    position: 'right'
                  }
                }}
              />
            </Grid>
          </Grid>
          </StyledLoader>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
