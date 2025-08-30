"use client";
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link,
    Typography,
    CircularProgress,
    Container,
    Grid,
    IconButton
} from '@mui/material';
import API from "@/Server/api";
import LocalHandler from "@/localHandler";
import DownloadIcon from "@mui/icons-material/Download";

function TestReportPage() {
    const [testMappings, setTestMappings] = useState([]);
    const [downloadData, setDownloadData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [client_id, setClientId] = useState(null);

    useEffect(() => {
        const fetchTestMappings = async () => {
            try {
                const response = await fetch(API.GET_TEST_MAPPINGS_FOR_ME());
                const data = await response.json();
                console.log(Object.keys(data.data).map(key => (createTestData(key, data.data[key]))));
                setTestMappings(Object.keys(data.data).map(key => (createTestData(key, data.data[key]))));
                setDownloadData(Object.keys(data.data).map(key => (createTestDownloadData(key, data.data[key], client_id, null, null, "not_started"))));

            } catch (error) {
                console.error("Error fetching test mappings:", error);
            } finally {
                setLoading(false);
            }
        };

        setClientId(LocalHandler.getClientId());
        fetchTestMappings();
    }, []);

    function createTestData(testName, testMappingId) {
        return {testName, testMappingId}
    }

    function createTestDownloadData(testName, testMappingId, clientId, wrongPdf, unattemptedPdf, status = "not_started") {
        // status -> not_started, started, failed, success
        return {testName, testMappingId, clientId, wrongPdf, unattemptedPdf, status}
    }

    function downloadTest(testName, testMappingId) {
        // Update status to "started" when download begins
        setDownloadData(prevData =>
            prevData.map(data =>
                data.testMappingId === testMappingId
                    ? {...data, status: "started"}
                    : data
            )
        );

        fetch(API.DOWNLOAD_TEST(client_id, testMappingId))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(response => {
                // Handle successful response
                setDownloadData(prevData =>
                    prevData.map(data => {
                        if (data.testMappingId === testMappingId) {
                            return {
                                ...data,
                                wrongPdf: response.data.wrong_pdf_url,
                                unattemptedPdf: response.data.unattempted_pdf_url,
                                status: "success"
                            };
                        }
                        return data;
                    })
                );
            })
            .catch(error => {
                console.error("Error downloading test:", error);
                // Update status to "failed" on error
                setDownloadData(prevData =>
                    prevData.map(data =>
                        data.testMappingId === testMappingId
                            ? {...data, status: "failed"}
                            : data
                    )
                );
            });
    }

    // Helper function to get download status for a specific test
    function getDownloadStatus(testMappingId) {
        const downloadItem = downloadData.find(item => item.testMappingId === testMappingId);
        return downloadItem ? downloadItem.status : "not_started";
    }

    // Helper function to get PDF URLs for a specific test
    function getPdfUrls(testMappingId) {
        const downloadItem = downloadData.find(item => item.testMappingId === testMappingId);
        return downloadItem ? {
            wrongPdf: downloadItem.wrongPdf,
            unattemptedPdf: downloadItem.unattemptedPdf
        } : { wrongPdf: null, unattemptedPdf: null };
    }

    // Function to render download cell based on status
    function renderDownloadCell(testMappingId, testName) {
        const status = getDownloadStatus(testMappingId);
        const { wrongPdf, unattemptedPdf } = getPdfUrls(testMappingId);

        switch (status) {
            case "started":
                return <CircularProgress size={24} />;
            case "failed":
                return (
                    <IconButton
                        aria-label="retry download"
                        onClick={() => downloadTest(testName, testMappingId)}
                        color="error"
                    >
                        <DownloadIcon />
                    </IconButton>
                );
            case "success":
                return (
                    <div>
                        {wrongPdf && (
                            <Link href={API.base_url + wrongPdf} target="_blank" rel="noopener noreferrer">
                                Wrong Answers PDF
                            </Link>
                        )}
                        <br />
                        {unattemptedPdf && (
                            <Link href={API.baunattemptedPdf} target="_blank" rel="noopener noreferrer">
                                Unattempted PDF
                            </Link>
                        )}
                    </div>
                );
            default: // "not_started"
                return (
                    <IconButton
                        aria-label="download"
                        onClick={() => downloadTest(testName, testMappingId)}
                    >
                        <DownloadIcon />
                    </IconButton>
                );
        }
    }

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Test Report
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Test Name</TableCell>
                                    <TableCell align="left">Test Mapping Id</TableCell>
                                    <TableCell align="left">Download</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {testMappings.map((row) => (
                                    <TableRow
                                        key={row.testMappingId}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.testName}
                                        </TableCell>
                                        <TableCell align="left">{row.testMappingId}</TableCell>
                                        <TableCell align="left">
                                            {renderDownloadCell(row.testMappingId, row.testName)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Container>
    );
}

export default TestReportPage;