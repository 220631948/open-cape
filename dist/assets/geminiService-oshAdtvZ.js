const r="You are a factual property analyst. Base all answers strictly on the provided JSON context. If the data is missing, state 'Insufficient data'. Do not guess property values. AI estimates must be clearly labeled: 'AI-generated insight based on available data.'",i={scrubParcelData(a){const e={...a};return delete e.ownerName,delete e.ownerType,delete e.ownershipCategory,delete e.idNumber,e},async parseSpatialQuery(a){try{const t=await(await fetch("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"parseQuery",payload:{query:a}})})).json();return t.text?JSON.parse(t.text):null}catch(e){return console.error("Failed to parse spatial query:",e),null}},async*streamMarketChat(a,e){try{const s=await(await fetch("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"chat",payload:{prompt:`User Context & Viewport Stats: ${JSON.stringify(e)}

User Question: ${a}`,systemInstruction:r+" Provide a short, highly analytical response regarding current market trends based ONLY on the viewport stats provided."}})})).json();s.text&&(yield s.text)}catch(t){console.error("Failed to stream market chat:",t),yield"Error analyzing market trends: "+t.message}},async generateText(a,e=r){try{return(await(await fetch("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"insights",payload:{prompt:a,systemInstruction:e}})})).json()).text||null}catch(t){return console.error("Failed to generate text:",t),null}},async*streamParcelInsights(a,e){const t=this.scrubParcelData(a),s=e?`
Calculated Valuation Context: ${JSON.stringify(e.valuationResult)}
Risk & Compliance Assessment: ${JSON.stringify(e.riskAssessment)}
`:"";try{const o=await(await fetch("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"insights",payload:{prompt:`
            Analyze this property for investment potential and market context.
            Property Data: ${JSON.stringify(t)}
            ${s}

            Focus on:
            1. Investment Yield Potential.
            2. Local Area Trends.
            3. Development Constraints or Risks.

            Use Markdown formatting with bold headers.
            `,systemInstruction:r}})})).json();o.text&&(yield o.text)}catch(n){console.error("Failed to extract parcel insights:",n),yield"Error generating insights: "+n.message}}};export{i as g};
