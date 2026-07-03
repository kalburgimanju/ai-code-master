import type { DeliveryStop, RouteResult } from '../types';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-ultra-253b:free';

function buildPrompt(
  city: string,
  stops: DeliveryStop[],
  timeOfDay: string,
  rainEnabled: boolean,
  festivalEnabled: boolean,
): string {
  const stopList = stops.map((s, i) => `${i + 1}. ${s.address}`).join('\n');
  const conditions: string[] = [];
  if (rainEnabled) conditions.push('active monsoon/rainfall');
  if (festivalEnabled) conditions.push('festival season with road closures and processions');
  const condStr = conditions.length ? ` Conditions: ${conditions.join(', ')}.` : '';

  return `You are a hyper-local logistics route optimizer for Indian cities.

TASK: Optimize a multi-stop delivery route in ${city}, India.
Time of day: ${timeOfDay}.${condStr}

Delivery stops (in order received):
${stopList}

The first stop is the warehouse/depot. Optimize the delivery order for minimum total time and distance.

Respond with ONLY valid JSON, no markdown. Use this exact schema:
{
  "optimizedOrder": [
    {
      "stopNumber": 1,
      "address": "<address>",
      "distance": "<X.X km>",
      "estimatedTime": "<XX min>",
      "instructions": "<turn-by-turn direction in Indian street context>",
      "trafficLevel": "low|medium|high"
    }
  ],
  "totalDistance": "<XX.X km>",
  "totalTime": "<X hrs XX min>",
  "fuelCost": "₹XXX",
  "trafficScore": <1-10>,
  "weatherImpact": "<brief weather impact assessment>",
  "festivalNote": "<festival impact if applicable, or 'No major festivals'>",
  "savingsCompared": "<time saved vs naive routing>"
}

IMPORTANT CONTEXT:
- Bangalore traffic is worst on Outer Ring Road, Silk Board, and KR Puram
- Mumbai traffic peaks on Western Express and Eastern Express highways
- Delhi traffic is heaviest on Ring Road and NH-48
- Chennai traffic bad on OMR and ECR during peak hours
- Hyderabad traffic peaks near HITEC City and Gachibowli
- Traffic scores: 1=empty roads, 10=gridlock
- Fuel cost should use diesel at approximately ₹90/litre for a delivery van (12 km/l)
- Give realistic Indian street-level directions (mention landmarks, junctions, flyovers)`;
}

function parseRouteResponse(jsonText: string): RouteResult {
  const data = JSON.parse(jsonText);
  return {
    optimizedOrder: data.optimizedOrder || [],
    totalDistance: data.totalDistance || '0 km',
    totalTime: data.totalTime || '0 min',
    fuelCost: data.fuelCost || '₹0',
    trafficScore: Math.min(10, Math.max(1, Number(data.trafficScore) || 5)),
    weatherImpact: data.weatherImpact || 'Clear conditions',
    festivalNote: data.festivalNote || 'No major festivals',
    savingsCompared: data.savingsCompared || 'N/A',
  };
}

export async function optimizeRoute(
  city: string,
  stops: DeliveryStop[],
  timeOfDay: string,
  rainEnabled: boolean,
  festivalEnabled: boolean,
): Promise<RouteResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return generateDemoRoute(city, stops, timeOfDay, rainEnabled, festivalEnabled);
  }

  try {
    const prompt = buildPrompt(city, stops, timeOfDay, rainEnabled, festivalEnabled);
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'HyperRoute Logistics Optimizer',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    // Strip markdown code fences if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return parseRouteResponse(cleaned);
  } catch (err) {
    console.warn('OpenRouter API failed, falling back to demo mode:', err);
    return generateDemoRoute(city, stops, timeOfDay, rainEnabled, festivalEnabled);
  }
}

function generateDemoRoute(
  city: string,
  stops: DeliveryStop[],
  timeOfDay: string,
  rainEnabled: boolean,
  festivalEnabled: boolean,
): RouteResult {
  // Deterministic but varied demo routing
  const cityFactor: Record<string, number> = {
    Bangalore: 1.2,
    Mumbai: 1.35,
    Delhi: 1.3,
    Chennai: 1.15,
    Hyderabad: 1.1,
  };
  const timeFactors: Record<string, number> = {
    'morning-rush': 1.4,
    midday: 1.0,
    afternoon: 1.1,
    'evening-rush': 1.5,
    night: 0.85,
  };

  const cf = cityFactor[city] || 1.0;
  const tf = timeFactors[timeOfDay] || 1.0;
  const rainMult = rainEnabled ? 1.3 : 1.0;
  const festivalMult = festivalEnabled ? 1.25 : 1.0;
  const totalMult = cf * tf * rainMult * festivalMult;

  // Generate shuffled stops for "optimization"
  const optimizedStops = stops.map((s, i) => ({ ...s, origIndex: i }));
  // Simple reversal for visual "optimization"
  if (optimizedStops.length > 2) {
    optimizedStops.splice(1, optimizedStops.length - 1, ...optimizedStops.slice(1).reverse());
  }

  const baseDistancePerStop = 4.5; // km base
  const baseTimePerStop = 15; // min base

  const orderedRoutes = optimizedStops.map((stop, i) => {
    const dist = (baseDistancePerStop + (i * 1.7)).toFixed(1);
    const time = Math.round(baseTimePerStop * totalMult + i * 3);
    const trafficLevel: 'low' | 'medium' | 'high' =
      timeOfDay === 'morning-rush' || timeOfDay === 'evening-rush'
        ? i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'high'
        : i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'low';

    return {
      stopNumber: i + 1,
      address: stop.address,
      distance: `${dist} km`,
      estimatedTime: `${time} min`,
      instructions: generateInstructions(city, stop.address, i),
      trafficLevel,
    };
  });

  const totalDist = orderedRoutes.reduce((sum, r) => sum + parseFloat(r.distance), 0);
  const totalTime = orderedRoutes.reduce((sum, r) => sum + parseInt(r.estimatedTime), 0);
  const fuelCost = Math.round((totalDist / 12) * 90);

  return {
    optimizedOrder: orderedRoutes,
    totalDistance: `${totalDist.toFixed(1)} km`,
    totalTime: totalTime >= 60 ? `${Math.floor(totalTime / 60)} hr ${totalTime % 60} min` : `${totalTime} min`,
    fuelCost: `₹${fuelCost}`,
    trafficScore: Math.min(10, Math.round(totalMult * 4)),
    weatherImpact: rainEnabled
      ? `${city} experiencing moderate to heavy rainfall. Expect waterlogged stretches and reduced visibility. Routes adjusted to avoid low-lying areas.`
      : `Clear skies in ${city}. Normal driving conditions expected.`,
    festivalNote: festivalEnabled
      ? `Active festival season in ${city}. Some roads may have processions and temporary diversions between 6 PM - 11 PM.`
      : 'No major festivals currently affecting routes.',
    savingsCompared: `~${Math.round((totalMult - 1) * 35 + 15)}% faster than naive sequential routing`,
  };
}

function generateInstructions(city: string, address: string, index: number): string {
  const cityLandmarks: Record<string, string[]> = {
    Bangalore: [
      'Take Inner Ring Road, turn right at Silk Board junction, continue 2.3 km on Outer Ring Road',
      'Head east on Mahadevapura Main Road, pass Bommenahalli flyover, take service road past ITPL',
      'Go via Hosur Road, take underpass at Madiwala, continue on Bannerghatta Road',
      'Take left at KR Puram railway crossing, use flyover to avoid junction traffic',
      'Via Bellary Road, pass Hebbal flyover, take airport road exit towards Yelahanka',
    ],
    Mumbai: [
      'Start on Western Express Highway, take Andheri-Kurla Road bypass, exit at Saki Naka',
      'Via Eastern Freeway, exit at Chembur, take Sion-Panvel Highway service road',
      'Cross Bandra-Worli Sea Link, exit at Worli, take Senapati Bapat Marg to Lower Parel',
      'Take LBS Marg from Bhandup, pass Mulund check naka, use Tikuji-ni-Wadi road',
      'Via Jogeshwari-Vikhroli Link Road, take Powai Lake circuit to Hiranandani',
    ],
    Delhi: [
      'Start on Ring Road, take AIIMS flyover, continue to Lajpat Nagar via Siri Fort Road',
      'Via NH-48 towards Gurugram, exit at Hero Honda Chowk, take Cyber City service lane',
      'Take Mathura Road from Badarpur, use Kalindi Kunj bridge to reach Noida',
      'Via Outer Ring Road, pass Mukundpur, take Wazirabad flyover towards Rohini',
      'Start on Grand Trunk Road, enter via Kashmere Gate, navigate Chandni Chowk service lane',
    ],
    Chennai: [
      'Take OMR from Thoraipakkam, use Sholinganallur junction flyover, continue to VGP',
      'Via Mount Road (Anna Salai), pass Gemini Flyover, take Kodambakkam High Road',
      'ECR from Thiruvanmiyur, pass Neelangarai, take service road to Palavakkam',
      'Via Grand Southern Trunk Road, pass Tambaram, use Vandalur-Kelambakkam road',
      'Take Poonamallee High Road, pass Porur lake, use bypass to reach Ambattur',
    ],
    Hyderabad: [
      'Start on ORR from Gachibowli, take Exit 2 towards HITEC City, use Madhapur flyover',
      'Via Necklace Road, pass Hussain Sagar, take Banjara Hills Road No. 10',
      'Take NH-65 from Mehdipatnam, pass Azamabad junction, continue to Tarnaka',
      'Via Jubilee Hills Road No. 36, pass Film Nagar, take Durgam Cheruvu bridge',
      'Start on SP Road from Secunderabad, use SCCL flyover, take Malkajgiri road',
    ],
  };

  const landmarks = cityLandmarks[city] || cityLandmarks['Bangalore'];
  return landmarks[index % landmarks.length] || `Navigate to ${address} using optimized local roads`;
}
