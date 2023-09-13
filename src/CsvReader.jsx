import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';

const CsvReader = ({ url }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    async function fetchCSV() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const parsedData = Papa.parse(text, { header: true });
        setData(parsedData?.data);
        setLoading(false);
      } catch (error) {
        console.error('Error while fetching CSV', error);
        setLoading(false);
      }
    }

    if (url) {
      fetchCSV();
    }
  }, [url]);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // Load and render the next batch of data when the table is in view
            renderNextBatch();
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.1, // Trigger when 10% of the table is visible
        }
      );

      // Start observing the table element
      if (tableRef.current) {
        observer.observe(tableRef.current);
      }

      // Cleanup the observer when the component unmounts
      return () => {
        if (tableRef.current) {
          observer.unobserve(tableRef.current);
        }
      };
    }
  }, [loading, data]);

  const renderNextBatch = () => {
    // Determine how many rows to render in the next batch
    const batchSize = 20; // You can adjust this value
    const startIndex = data.length;
    const endIndex = startIndex + batchSize;

    // If there are more rows to render, add them to the data state
    if (endIndex < data.length) {
      const nextBatch = data.slice(startIndex, endIndex);
      setData((prevData) => [...prevData, ...nextBatch]);
    }
  };

  return (
    <div className="csv-reader">
      <div className="table-container">
        {loading &&  <div className="url-loading"><div>Loading...</div></div>}
        {!loading && data.length > 0 && (
          <table className="csv-table" ref={tableRef}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CsvReader;
