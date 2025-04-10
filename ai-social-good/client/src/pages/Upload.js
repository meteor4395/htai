import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  makeStyles,
  Grid,
  CircularProgress,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  input: {
    display: 'none',
  },
  uploadButton: {
    margin: theme.spacing(2),
  },
  uploadIcon: {
    marginRight: theme.spacing(1),
  },
}));

const Upload = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async (type) => {
    if (!selectedFile) {
      setAlert({
        open: true,
        message: 'Please select a file first',
        severity: 'warning',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/analyze/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setAlert({
        open: true,
        message: 'Analysis completed successfully!',
        severity: 'success',
      });
      console.log(response.data);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error processing file: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h5" gutterBottom>
              Upload Files for Analysis
            </Typography>
            <input
              accept="image/*,audio/*"
              className={classes.input}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                color="primary"
                component="span"
                className={classes.uploadButton}
                startIcon={<CloudUploadIcon />}
              >
                Select File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body1" gutterBottom>
                Selected: {selectedFile.name}
              </Typography>
            )}
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpload('voice')}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Voice'}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpload('image')}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Image'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Upload; 