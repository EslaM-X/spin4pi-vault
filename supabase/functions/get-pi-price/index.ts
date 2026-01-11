const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceCache {
  price: number;
  change24h: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;
const CACHE_DURATION = 30000; // 30 seconds cache

async function fetchOKXPrice(): Promise<{ price: number; change24h: number }> {
  try {
    // OKX API for PI/USDT ticker
    const response = await fetch(
      'https://www.okx.com/api/v5/market/ticker?instId=PI-USDT',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Spin4Pi/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== '0' || !data.data || data.data.length === 0) {
      throw new Error('Invalid OKX response');
    }

    const ticker = data.data[0];
    const price = parseFloat(ticker.last);
    const open24h = parseFloat(ticker.open24h);
    const change24h = open24h > 0 ? ((price - open24h) / open24h) * 100 : 0;

    return { price, change24h };
  } catch (error) {
    console.error('OKX fetch error:', error);
    
    // Try backup API (CoinGecko)
    try {
      const cgResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&include_24hr_change=true'
      );
      
      if (cgResponse.ok) {
        const cgData = await cgResponse.json();
        if (cgData['pi-network']) {
          return {
            price: cgData['pi-network'].usd || 0,
            change24h: cgData['pi-network'].usd_24h_change || 0
          };
        }
      }
    } catch (cgError) {
      console.error('CoinGecko backup fetch error:', cgError);
    }
    
    // Return last cached value or fallback
    if (priceCache) {
      return { price: priceCache.price, change24h: priceCache.change24h };
    }
    
    return { price: 0, change24h: 0 };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Check cache
    if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
      return new Response(
        JSON.stringify({
          price: priceCache.price,
          change24h: priceCache.change24h,
          cached: true,
          timestamp: priceCache.timestamp
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=30'
          } 
        }
      );
    }

    // Fetch fresh price
    const { price, change24h } = await fetchOKXPrice();
    
    // Update cache
    priceCache = {
      price,
      change24h,
      timestamp: now
    };

    return new Response(
      JSON.stringify({
        price,
        change24h,
        cached: false,
        timestamp: now
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        } 
      }
    );

  } catch (error) {
    console.error('Price fetch error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        price: priceCache?.price || 0,
        change24h: priceCache?.change24h || 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
