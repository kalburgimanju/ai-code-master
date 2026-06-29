import { destinations, hotels, tripPlans, costEstimates } from '@/data/destinations';

// ── Simulated AI chat responses ──
const greetings = [
  'Welcome to AI Travel Agency! 🌍 I\'m your personal travel assistant. Where would you like to go?',
  'Hey there! ✈️ Planning a trip? I can help with destinations, hotels, itineraries, and more!',
  'Hello, traveler! 🏖️ Tell me your dream destination and I\'ll craft the perfect trip for you.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function matchDestination(input: string) {
  const lower = input.toLowerCase();
  return destinations.find(
    (d) =>
      lower.includes(d.name.toLowerCase()) ||
      lower.includes(d.country.toLowerCase()) ||
      lower.includes(d.id)
  );
}

function matchHotel(input: string, destId?: string) {
  const lower = input.toLowerCase();
  return hotels.find(
    (h) =>
      (destId ? h.destinationId === destId : true) &&
      (lower.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(lower))
  );
}

function matchTripPlan(input: string, destId?: string) {
  const lower = input.toLowerCase();
  return tripPlans.find(
    (tp) =>
      (destId ? tp.destinationId === destId : true) &&
      (lower.includes(tp.name.toLowerCase()) || tp.name.toLowerCase().includes(lower))
  );
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function generateAIResponse(input: string): string {
  const lower = input.toLowerCase();

  // Greeting
  if (lower.match(/^(hi|hello|hey|good morning|good evening)/)) {
    return pick(greetings);
  }

  // Help
  if (lower.includes('help') || lower.includes('what can you')) {
    return `I can help you with:\n\n🗺️ **Destinations** — "Tell me about Bali"\n🏨 **Hotels** — "Find hotels in Paris"\n📋 **Trip Plans** — "Show me trip plans for Tokyo"\n💰 **Cost Estimation** — "How much for a Goa trip?"\n📦 **Booking** — "Book a trip to Santorini"\n📞 **Follow-up** — "Where is my booking?"\n\nJust type naturally and I'll assist you!`;
  }

  // Destinations listing
  if (lower.includes('destination') || lower.includes('where') || lower.includes('places') || lower.includes('explore')) {
    const list = destinations
      .map((d) => `• **${d.name}, ${d.country}** — ${d.tagline} (from ${formatCurrency(d.avgCost)}/person)`)
      .join('\n');
    return `🌍 **Our Destinations:**\n\n${list}\n\nTell me more about any destination to get details!`;
  }

  // Cost estimation
  if (lower.includes('cost') || lower.includes('price') || lower.includes('budget') || lower.includes('how much') || lower.includes('expensive') || lower.includes('cheap')) {
    const dest = matchDestination(input);
    if (dest) {
      const est = costEstimates.find((e) => e.destination === dest.name);
      if (est) {
        return `💰 **Cost Estimate for ${dest.name}:**\n\n| Category | Price/Person |\n|----------|-------------|\n| 🎒 Budget | ${formatCurrency(est.budget)} |\n| 🏨 Standard | ${formatCurrency(est.standard)} |\n| ✨ Premium | ${formatCurrency(est.premium)} |\n| 👑 Luxury | ${formatCurrency(est.luxury)} |\n\nPrices include flights, hotel, meals, and activities for the recommended duration.\n\nWould you like to book? Just say "book ${dest.name}"!`;
      }
    }
    return `💰 **General Cost Ranges:**\n\n• Budget trips: ${formatCurrency(18000)} - ${formatCurrency(45000)}\n• Standard trips: ${formatCurrency(50000)} - ${formatCurrency(100000)}\n• Premium trips: ${formatCurrency(100000)} - ${formatCurrency(200000)}\n• Luxury trips: ${formatCurrency(200000)}+\n\nAsk about a specific destination for detailed pricing!`;
  }

  // Hotel search
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('accommodation') || lower.includes('resort')) {
    const dest = matchDestination(input);
    const destId = dest?.id;
    const destHotels = destId ? hotels.filter((h) => h.destinationId === destId) : hotels;

    if (destHotels.length > 0) {
      const list = destHotels
        .map((h) => `• **${h.name}** — ${'⭐'.repeat(h.stars)} — ${formatCurrency(h.pricePerNight)}/night — Rating: ${h.rating}/5\n  ${h.amenities.slice(0, 4).join(' · ')}`)
        .join('\n\n');
      return `🏨 **Hotels${dest ? ` in ${dest.name}` : ''}:**\n\n${list}\n\nWant to book one? Just say "book [hotel name]"!`;
    }
    return `Sorry, I couldn't find hotels for that location. Try asking about hotels in Bali, Paris, Tokyo, or Goa!`;
  }

  // Trip plans
  if (lower.includes('trip plan') || lower.includes('itinerary') || lower.includes('package') || lower.includes('tour')) {
    const dest = matchDestination(input);
    const destId = dest?.id;
    const plans = destId ? tripPlans.filter((tp) => tp.destinationId === destId) : tripPlans;

    if (plans.length > 0) {
      const list = plans
        .map((tp) => `• **${tp.name}** (${tp.days}D/${tp.days - 1}N) — ${formatCurrency(tp.price)}/person\n  ${tp.description}\n  Highlights: ${tp.itinerary[0]?.activities.slice(0, 3).join(', ')}`)
        .join('\n\n');
      return `📋 **Trip Plans${dest ? ` for ${dest.name}` : ''}:**\n\n${list}\n\nSay "book [trip name]" to reserve your spot!`;
    }
    return `No trip plans found for that destination. Ask about Bali, Paris, Tokyo, or Goa!`;
  }

  // Booking
  if (lower.includes('book') || lower.includes('reserve')) {
    const dest = matchDestination(input);
    if (dest) {
      const plan = matchTripPlan(input, dest.id);
      const planInfo = plan
        ? `\n📋 Plan: **${plan.name}** (${plan.days}D/${plan.days - 1}N)\n💰 Price: ${formatCurrency(plan.price)}/person`
        : '';
      return `📦 **Booking for ${dest.name}, ${dest.country}**${planInfo}\n\nTo complete your booking, please visit our booking page or provide:\n\n1️⃣ Your full name\n2️⃣ Email address\n3️⃣ Phone number\n4️⃣ Check-in date\n5️⃣ Number of guests\n\n[Go to Booking →](/booking?dest=${dest.id})\n\nI'll send you a confirmation and follow-up details!`;
    }
    return `Where would you like to book? Tell me the destination and I'll help you plan!`;
  }

  // Follow-up
  if (lower.includes('follow') || lower.includes('status') || lower.includes('booking status') || lower.includes('where is my')) {
    return `📞 **Follow-up & Support**\n\nTo check your booking status, please visit our follow-up page where you can:\n\n• Track your booking status\n• Chat with our travel agents\n• Get real-time updates on your trip\n• Request changes to your itinerary\n\n[Go to Follow-up →](/follow-up)\n\nOr share your booking ID and I'll look it up!`;
  }

  // Best time to visit
  if (lower.includes('best time') || lower.includes('when to visit') || lower.includes('season')) {
    const dest = matchDestination(input);
    if (dest) {
      return `📅 **Best time to visit ${dest.name}:**\n\n${dest.bestSeason}\n\n${dest.name} is known for: ${dest.highlights.slice(0, 3).join(', ')}.\n\nWould you like to see trip plans for ${dest.name}?`;
    }
    return `Ask me about the best time to visit a specific destination! For example: "Best time to visit Bali?"`;
  }

  // Default with destination match
  const dest = matchDestination(input);
  if (dest) {
    return `🌍 **${dest.name}, ${dest.country}**\n\n${dest.description}\n\n⭐ Rating: ${dest.rating}/5 (${dest.reviewCount.toLocaleString()} reviews)\n💰 Starting from: ${formatCurrency(dest.avgCost)}/person\n📅 Best season: ${dest.bestSeason}\n\n**Highlights:**\n${dest.highlights.map((h) => `• ${h}`).join('\n')}\n\nWhat would you like to know?\n• "Hotels in ${dest.name}"\n• "Trip plans for ${dest.name}"\n• "Cost of ${dest.name}"\n• "Book ${dest.name}"`;
  }

  // Fallback
  return `I'd love to help you with that! Here are some things I can do:\n\n🌍 "Tell me about Bali" — destination info\n🏨 "Hotels in Paris" — find hotels\n📋 "Trip plans for Tokyo" — view packages\n💰 "Cost of Swiss Alps trip" — pricing\n📦 "Book a Goa trip" — make a reservation\n📞 "Follow up on my booking" — support\n❓ "Help" — see all options\n\nWhere would you like to travel?`;
}
