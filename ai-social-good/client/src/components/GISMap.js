import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, CircularProgress } from '@material-ui/core';

// Replace with your Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    position: 'relative',
    height: '400px',
    width: '100%',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(1),
    zIndex: 2,
  },
}));

const GISMap = ({ data, type = 'incidents' }) => {
  const classes = useStyles();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-74.5, 40], // Default to NYC area
      zoom: 9,
    });

    map.current.on('load', () => {
      setLoading(false);
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add data source
      map.current.addSource('incidents', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'incidents',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      // Add cluster count layer
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidents',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      // Add unclustered point layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'incidents',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });
    });

    // Cleanup
    return () => map.current?.remove();
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const features = data.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.longitude, item.latitude],
      },
      properties: {
        id: item.id,
        type: item.type,
        severity: item.severity,
        timestamp: item.timestamp,
        description: item.description,
      },
    }));

    const source = map.current.getSource('incidents');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features,
      });
    }
  }, [data]);

  // Add click handlers for clusters and points
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.on('click', 'clusters', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('incidents').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        }
      );
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { description, type, severity, timestamp } = e.features[0].properties;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <h3>${type}</h3>
          <p>${description}</p>
          <p>Severity: ${severity}</p>
          <p>Time: ${new Date(timestamp).toLocaleString()}</p>
        `)
        .addTo(map.current);
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current.getCanvas().style.cursor = '';
    });
  }, []);

  return (
    <Paper className={classes.mapContainer}>
      {loading && (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      )}
      <div ref={mapContainer} style={{ height: '100%' }} />
      <Paper className={classes.legend}>
        <Typography variant="subtitle2">Legend</Typography>
        <Typography variant="body2">
          🔵 Single incident
          <br />
          ⚪ Cluster (zoom in for details)
        </Typography>
      </Paper>
    </Paper>
  );
};

export default GISMap; 