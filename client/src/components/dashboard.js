import React from 'react';
import { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Item from '@mui/material/ListItem'
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CommonNavbar from "./commonNavbar";
import Container from '@mui/material/Container';
import CommonSidebar from "./commonSidebar";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const BASE_URL = require("../utils/url").default;

const Dashboard = () => {

  const navigate = useNavigate()
  const [todos, setTodos] = useState([]);
  const theme = createTheme();

  useEffect(() => {

    async function fetchData() {
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log(userData.userDetails.email)
      const user_id = userData.userDetails.email;
    

      axios.get(`${BASE_URL}getAllTodos/${user_id}`)
        .then(async function (response) {
    
          console.log(response);
       
          setTodos(response.data)
        })
        .catch(function (error) {
   
          console.log(error);
        })
        .finally(function () {
        
        });
      
    }

    fetchData();
  }, []);

  const style = {
    paperStyle: {
      boxShadow:
        "0px 1px 1px -2px #d6d2d2,0px 1px 1px 0px #d6d2d2,0px 1px 1px 1px #d6d2d2"
    },
    blueButton: {
      backgroundColor: '#1e69ba',
      color: 'white'
    }
  }

  const handleDetailsClick = (element) => {
    const user_id = element.record.user_id;
    const task_id = element.record.task_id;
    console.log(user_id, task_id);
    
    axios.delete(`${BASE_URL}todo/delete/${task_id}/${user_id}`)
      .then(response => {
        navigate('/add-to-do-list')
        alert('Task deleted successfully');
      })
      .catch(error => {
        alert('Error deleting task:', error);
      });
  }

  const handleUpdateClick = (record) => {
    console.log(record);
    navigate('/update', { state:record });
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CommonNavbar />
        <CommonSidebar />
        <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
          <Paper sx={{ mt: { xs: 6, md: 6 }, p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} sx={{ margin: 'auto', textAlign: 'center' }}>
                <Typography component="h1" variant="h4" >
                  View All TO DO LISTS
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" href="/add-to-do-list" sx={{ width: 200 }}>
                  Add Tasks
                </Button>

              </Grid>
            </Grid>
            <br />
            <Box sx={{ mt: 3 }}>
              <React.Fragment>
                <Stack container spacing={2}>
                  {todos.map(function (record, index) {
                    console.log(record);
                    return (
                      <Stack item xs={12} sm={12} sx={{ borderRadius: '10px' }}>
                        <Paper style={style.paperStyle}>
                          <Grid container spacing={3} key={index} >
                            <Grid item xs={12} sm={4} >
                              <Item  >
                                <Typography variant="h4" >Task Title: {record.task_title}</Typography>
                              </Item>
                              <Item sx={{ wordBreak: 'break-word' }}>
                                <Typography variant="h6" >Task Description: {record.task_description.split(' ').slice(0,10).join(' ')}</Typography>
                              </Item>


                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ margin: 'auto' }}>
                              <Item sx={{ wordBreak: 'break-word' }}>
                                <Typography variant="h6" >Task Status: {record.is_completed.split(' ').slice(0, 10).join(' ')}</Typography>
                              </Item>
                              <Item sx={{ wordBreak: 'break-word' }}>
                                <Typography variant="h6" >Task Due Date: {record.task_due_date.split(' ').slice(0, 10).join(' ')}</Typography>
                              </Item>

                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ margin: 'auto' }}>
                              <Box textAlign='center'>
                                <Button
                                  onClick={() => handleDetailsClick({ record })}
                                  style={style.blueButton}
                                  size="medium"
                                  variant="outlined"
                                  sx={{ mt: 1, mb: 1, mr: 1, ml: 1 }}
                                >
                                  Delete
                                </Button>
                                <Button
                                  onClick={() => handleUpdateClick({ record })}
                                  style={style.blueButton}
                                  size="medium"
                                  variant="outlined"
                                  sx={{ mt: 1, mb: 1, mr: 1, ml: 1 }}
                                >
                                  Update
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Stack>
                    )
                  })}
                </Stack>
              </React.Fragment>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;