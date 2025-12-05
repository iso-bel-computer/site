exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get the search query from URL parameters
  const { q } = event.queryStringParameters || {};
  
  if (!q) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing search query' })
    };
  }

  try {
    // Make request to Companies House API
    const response = await fetch(
      `https://api.company-information.service.gov.uk/search/officers?q=${encodeURIComponent(q)}&items_per_page=20`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.COMPANIES_HOUSE_API_KEY + ':').toString('base64')}`
        }
      }
    );

    const data = await response.json();

    // Return the data with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};