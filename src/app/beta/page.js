'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import API from "@/Server/api";
import MPDPlayer from "@/components/MPDPlayer"


export default function VideoPage() {
  // State to store the extracted batch_name and id from URL
  const [batchName, setBatchName] = useState(null);
  const [id, setId] = useState(null);

  // State to store the fetched video data (URL, KID, Key)
  const [videoData, setVideoData] = useState(null);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // State to manage error messages
  const [error, setError] = useState(null);

  // Effect to extract batch_name and id from the URL query parameters
  useEffect(() => {
    // Ensure this code runs only on the client-side where 'window' is defined
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setBatchName(params.get('batch_name'));
      setId(params.get('id'));
    }
  }, []); // Empty dependency array means this effect runs once after the initial render

  // Effect to fetch video details from the API once batchName and id are available
  useEffect(() => {
    const fetchVideoDetails = async () => {
      // Only attempt to fetch if both batchName and id are present
      if (batchName && id) {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors

        try {
          // Construct the API URL using the provided API method
          const apiUrl = API.GET_SPECIFIC_LECTURE_DETAIL(batchName, id);

          // Perform the fetch request
          const response = await fetch(apiUrl);

          // Check if the response was successful
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Parse the JSON response
          const result = await response.json();

          // Check if the expected data structure is present
          if (result && result.data) {
            setVideoData(result.data); // Update videoData state with fetched data
          } else {
            setError('API response did not contain expected video data.');
          }
        } catch (err) {
          console.error("Failed to fetch video details:", err);
          setError(`Failed to load video details: ${err.message}. Please try again later.`);
        } finally {
          setLoading(false); // Set loading to false after fetch attempt (success or failure)
        }
      } else if (batchName === null && id === null) {
        // If both are still null, it means the first useEffect hasn't finished or URL params are truly missing.
        // Keep loading true if we are still waiting for URL params to be parsed.
        // However, if the first useEffect has run and they are still null, it indicates missing params.
        // We'll handle the 'missing params' case below once loading is false.
        setLoading(true); // Still waiting for initial URL parsing
      } else {
        // If one or both are null after the initial URL parsing, it means parameters are missing.
        setLoading(false);
        setError('Batch name or ID is missing from the URL. Please check your URL parameters.');
      }
    };

    // Call the fetch function
    fetchVideoDetails();
  }, [batchName, id]); // This effect re-runs whenever batchName or id changes

  // --- Render Logic based on Loading/Error/Data States ---

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading video details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Please ensure the URL contains valid 'batch_name' and 'id' query parameters (e.g., `?batch_name=yourBatch&id=yourId`).
        </Typography>
      </Container>
    );
  }

  // If loading is false and no error, but videoData is still null, something unexpected happened
  if (!videoData) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Alert severity="warning">
          Video data could not be loaded. This might indicate an issue with the API response structure or network.
        </Alert>
      </Container>
    );
  }

  // If videoData is successfully loaded, render the MPDPlayer
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        New Lecture Viewer
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Dynamically loaded video content
      </Typography>

      {/* Display the extracted params for verification */}
      {batchName && <Typography variant="subtitle1" sx={{ color: 'text.primary' }}><strong>Batch Name:</strong> {batchName}</Typography>}
      {id && <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.primary' }}><strong>ID:</strong> {id}</Typography>}

      <MPDPlayer
        pwMPDUrl={videoData.url}
        drmKey={{
          kid: videoData.kid,
          key: videoData.key
        }}
        // You can pass other props here if your MPDPlayer component supports them
        // For example, if your API returned licenseUrl, licenseAuthToken, clientId:
        // licenseUrl={videoData.licenseUrl}
        // licenseAuthToken={videoData.licenseAuthToken}
        // clientId={videoData.clientId}
      />
    </Container>
  );
}
