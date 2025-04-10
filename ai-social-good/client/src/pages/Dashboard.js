import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  makeStyles,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Box,
} from '@material-ui/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GISMap from '../components/GISMap';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  chartContainer: {
    height: 300,
    marginTop: theme.spacing(2),
  },
  listItem: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(1),
  },
  confidence: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  fraudAlert: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
    backgroundColor: theme.palette.error.light,
    padding: theme.spacing(2),
  },
  mapContainer: {
    marginTop: theme.spacing(3),
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    imageAnalyses: 0,
    voiceAnalyses: 0,
    fraudDetections: 0,
  });
  const [gisData, setGisData] = useState([]);

  // Mock GIS data for demonstration
  const mockGisData = [
    {
      id: 1,
      type: 'Emergency',
      latitude: 40.7128,
      longitude: -74.0060,
      severity: 'High',
      timestamp: new Date().toISOString(),
      description: 'Flood warning in downtown area',
    },
    {
      id: 2,
      type: 'Aid Distribution',
      latitude: 40.7589,
      longitude: -73.9851,
      severity: 'Medium',
      timestamp: new Date().toISOString(),
      description: 'Food and medical supplies distribution center',
    },
  ];

  // Mock data for the chart
  const analysisData = [
    { name: 'Images', count: stats.imageAnalyses },
    { name: 'Voice', count: stats.voiceAnalyses },
    { name: 'Fraud Detection', count: stats.fraudDetections },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analyses`);
        const { analyses, stats: statsData } = response.data;
        
        setRecentAnalyses(analyses);
        setStats(statsData);
        setGisData(mockGisData); // Replace with actual API call in production
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderAnalysisResult = (analysis) => {
    switch (analysis.type) {
      case 'image':
        return (
          <List dense>
            {analysis.predictions.map((pred, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemText
                  primary={pred.description}
                  secondary={
                    <Typography variant="body2" className={classes.confidence}>
                      Confidence: {(pred.confidence * 100).toFixed(1)}%
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        );
      case 'voice':
        return (
          <ListItem className={classes.listItem}>
            <ListItemText
              primary="Transcribed Text"
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {analysis.text}
                  </Typography>
                  <Typography variant="body2" className={classes.confidence}>
                    Confidence: {(analysis.confidence * 100).toFixed(1)}%
                  </Typography>
                </>
              }
            />
          </ListItem>
        );
      case 'fraud':
        return (
          <Box className={classes.fraudAlert}>
            <Typography variant="subtitle1" color="error">
              Potential Fraud Detected
            </Typography>
            <Typography variant="body2">
              Probability: {(analysis.fraud_probability * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2">Risk Factors:</Typography>
            <List dense>
              {analysis.risk_factors.map((factor, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={factor.factor}
                    secondary={`Impact: ${(factor.importance * 100).toFixed(1)}%`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container className={classes.root}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Analysis Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Statistics Overview */}
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Total Analyses"
                  secondary={stats.totalAnalyses}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Image Analyses"
                  secondary={stats.imageAnalyses}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Voice Analyses"
                  secondary={stats.voiceAnalyses}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Fraud Detections"
                  secondary={stats.fraudDetections}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Analysis Distribution
            </Typography>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>

        {/* GIS Map */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Geographic Distribution
            </Typography>
            <div className={classes.mapContainer}>
              <GISMap data={gisData} />
            </div>
          </Paper>
        </Grid>

        {/* Recent Analyses */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Recent Analyses
            </Typography>
            <Grid container spacing={2}>
              {recentAnalyses.map((analysis) => (
                <Grid item xs={12} md={6} key={analysis.id}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)} Analysis
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {new Date(analysis.timestamp).toLocaleString()}
                      </Typography>
                      {renderAnalysisResult(analysis)}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 